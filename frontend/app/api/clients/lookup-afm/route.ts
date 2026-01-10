import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateAFM } from '@/lib/validation/afmValidator';
import { checkGreekAFM_VIES, checkVATVIES_WithRetry } from '@/lib/integrations/viesClient';
import { headers } from 'next/headers';

// Types
interface LookupRequest {
  afm: string;
  forceRefresh?: boolean; // Skip cache and force new lookup
}

interface LookupResponse {
  afm: string;
  entityType: 'company' | 'individual' | 'unknown';
  verificationStatus: 'verified' | 'partial' | 'not_found' | 'error';
  sources: {
    vies?: {
      status: 'ok' | 'not_found' | 'error' | 'timeout';
      checkedAt: string;
    };
  };
  data?: {
    legalName?: string;
    tradeName?: string;
    legalForm?: string;
    doy?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      region?: string;
    };
    status?: 'active' | 'inactive' | 'unknown';
  };
}

interface ErrorResponse {
  error: string;
  code: string;
}

// Rate limiting: 30 requests per minute per user
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

// Cache duration: 24 hours
const CACHE_DURATION_HOURS = 24;

/**
 * POST /api/clients/lookup-afm
 *
 * Lookup client information by Greek AFM (tax number)
 *
 * @param request - Request body with AFM
 * @returns Client information from VIES and other sources
 */
export async function POST(request: NextRequest) {
  try {
    // Get Supabase client
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: LookupRequest = await request.json();
    const { afm, forceRefresh = false } = body;

    if (!afm) {
      return NextResponse.json<ErrorResponse>(
        { error: 'AFM is required', code: 'MISSING_AFM' },
        { status: 400 }
      );
    }

    // Validate AFM format
    const validation = validateAFM(afm);
    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        { error: validation.error || 'Invalid AFM format', code: 'INVALID_AFM_FORMAT' },
        { status: 400 }
      );
    }

    const cleanAFM = afm.replace(/\D/g, '');

    // Check rate limit
    const rateLimitOk = await checkRateLimit(supabase, user.id);
    if (!rateLimitOk) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Rate limit exceeded. Maximum 30 requests per minute.', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    // Check cache (unless forceRefresh)
    if (!forceRefresh) {
      const cachedResult = await getCachedLookup(supabase, cleanAFM);
      if (cachedResult) {
        console.log(`[AFM Lookup] Cache hit for AFM ${cleanAFM}`);
        return NextResponse.json<LookupResponse>(cachedResult);
      }
    }

    // Perform lookup
    console.log(`[AFM Lookup] Looking up AFM ${cleanAFM}...`);

    const result = await performAFMLookup(cleanAFM);

    // Save to database
    await saveLookupResult(supabase, user.id, cleanAFM, result, request);

    // Return result
    return NextResponse.json<LookupResponse>(result);
  } catch (error: any) {
    console.error('[AFM Lookup] Error:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Check rate limit for user
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns true if within rate limit, false otherwise
 */
async function checkRateLimit(supabase: any, userId: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  const { count, error } = await supabase
    .from('client_lookups')
    .select('*', { count: 'exact', head: true })
    .eq('requested_by_user_id', userId)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('[Rate Limit] Error checking rate limit:', error);
    return true; // Allow request on error
  }

  return (count || 0) < RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Get cached lookup result
 *
 * @param supabase - Supabase client
 * @param afm - AFM to lookup
 * @returns Cached result or null
 */
async function getCachedLookup(supabase: any, afm: string): Promise<LookupResponse | null> {
  const cacheExpiry = new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('afm', afm)
    .gte('updated_at', cacheExpiry.toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  // Convert database record to LookupResponse
  return {
    afm: data.afm,
    entityType: data.entity_type,
    verificationStatus: data.verification_status,
    sources: {}, // Not stored in cache
    data: {
      legalName: data.legal_name,
      tradeName: data.trade_name,
      legalForm: data.legal_form,
      doy: data.doy,
      address: data.address_json,
      status: data.status,
    },
  };
}

/**
 * Perform AFM lookup using available sources
 *
 * @param afm - AFM to lookup
 * @returns Lookup result
 */
async function performAFMLookup(afm: string): Promise<LookupResponse> {
  const result: LookupResponse = {
    afm,
    entityType: 'unknown',
    verificationStatus: 'not_found',
    sources: {},
  };

  // 1. Check VIES (EU VAT system)
  try {
    const viesResult = await checkVATVIES_WithRetry('EL', afm);
    result.sources.vies = {
      status: viesResult.status,
      checkedAt: viesResult.checkedAt,
    };

    if (viesResult.status === 'ok' && viesResult.data) {
      result.verificationStatus = 'verified';
      result.entityType = 'company'; // VIES only has companies

      result.data = {
        legalName: viesResult.data.name,
        tradeName: viesResult.data.name,
        address: parseVIESAddress(viesResult.data.address),
        status: 'active',
      };
    }
  } catch (error: any) {
    console.error('[AFM Lookup] VIES error:', error);
    result.sources.vies = {
      status: 'error',
      checkedAt: new Date().toISOString(),
    };
  }

  // 2. TODO: Check GEMI (Greek Business Registry)
  // This would require a paid API or web scraping
  // For now, we only use VIES

  // Determine final verification status
  if (result.verificationStatus === 'not_found') {
    // No data from any source
    result.verificationStatus = 'not_found';
  } else if (result.verificationStatus === 'verified') {
    // Full data from VIES
    result.verificationStatus = 'verified';
  }

  return result;
}

/**
 * Parse VIES address string into structured format
 *
 * VIES returns address as a single string, we try to parse it
 *
 * @param addressString - Address from VIES
 * @returns Structured address object
 */
function parseVIESAddress(addressString?: string): any {
  if (!addressString) {
    return {};
  }

  // VIES address format varies by country
  // For Greece, it's usually: STREET, POSTAL_CODE CITY
  const parts = addressString.split(',').map((s) => s.trim());

  return {
    street: parts[0] || '',
    city: parts[1] || '',
    postalCode: '', // Not usually provided by VIES
    region: '',
  };
}

/**
 * Save lookup result to database
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param afm - AFM that was looked up
 * @param result - Lookup result
 * @param request - HTTP request (for IP, user-agent)
 */
async function saveLookupResult(
  supabase: any,
  userId: string,
  afm: string,
  result: LookupResponse,
  request: NextRequest
) {
  try {
    // 1. Upsert client record
    let clientId: string | null = null;

    if (result.verificationStatus !== 'error') {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert(
          {
            afm: afm,
            entity_type: result.entityType,
            verification_status: result.verificationStatus,
            legal_name: result.data?.legalName,
            trade_name: result.data?.tradeName,
            legal_form: result.data?.legalForm,
            doy: result.data?.doy,
            address_json: result.data?.address || {},
            status: result.data?.status,
          },
          {
            onConflict: 'afm',
          }
        )
        .select()
        .single();

      if (!clientError && clientData) {
        clientId = clientData.id;
      }
    }

    // 2. Log lookup in audit table
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await supabase.from('client_lookups').insert({
      client_id: clientId,
      afm: afm,
      requested_by_user_id: userId,
      sources_json: result.sources,
      result_hash: JSON.stringify(result.data), // Simple hash for change detection
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error: any) {
    console.error('[AFM Lookup] Error saving to database:', error);
    // Don't fail the request if save fails
  }
}
