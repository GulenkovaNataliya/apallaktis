// API Route: Public AFM Lookup (for registration)
// ================================================
// Публичный API для поиска по ΑΦΜ (без авторизации)

import { NextRequest, NextResponse } from 'next/server';
import { validateAFM } from '@/lib/validation/afmValidator';
import { checkVATVIES_WithRetry } from '@/lib/integrations/viesClient';

interface LookupResponse {
  success: boolean;
  data?: {
    legalName?: string;
    address?: string;
    activity?: string;
    doy?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { afm } = await request.json();

    if (!afm) {
      return NextResponse.json<LookupResponse>(
        { success: false, error: 'ΑΦΜ is required' },
        { status: 400 }
      );
    }

    // Validate AFM format
    const cleanAFM = afm.replace(/\D/g, '');
    if (cleanAFM.length !== 9) {
      return NextResponse.json<LookupResponse>(
        { success: false, error: 'ΑΦΜ must be 9 digits' },
        { status: 400 }
      );
    }

    // Check VIES (EU VAT system)
    console.log(`[Public AFM Lookup] Looking up AFM ${cleanAFM}...`);

    const viesResult = await checkVATVIES_WithRetry('EL', cleanAFM);

    if (viesResult.status === 'ok' && viesResult.data) {
      // Parse address
      const addressParts = viesResult.data.address?.split(',').map(s => s.trim()) || [];

      return NextResponse.json<LookupResponse>({
        success: true,
        data: {
          legalName: viesResult.data.name || '',
          address: viesResult.data.address || '',
          activity: '', // VIES doesn't provide activity
          doy: '', // VIES doesn't provide DOY
        },
      });
    } else {
      return NextResponse.json<LookupResponse>({
        success: false,
        error: 'ΑΦΜ δεν βρέθηκε στο VIES',
      });
    }
  } catch (error: any) {
    console.error('[Public AFM Lookup] Error:', error);
    return NextResponse.json<LookupResponse>(
      { success: false, error: 'Σφάλμα σύνδεσης με VIES' },
      { status: 500 }
    );
  }
}
