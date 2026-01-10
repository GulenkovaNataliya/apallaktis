/**
 * VIES Client - EU VAT Information Exchange System
 *
 * Public EU service for validating VAT numbers (including Greek AFM)
 * SOAP API documentation: https://ec.europa.eu/taxation_customs/vies/technicalInformation.html
 */

export interface VIESResponse {
  valid: boolean;
  countryCode: string;
  vatNumber: string;
  requestDate: string;
  name?: string;
  address?: string;
  errorCode?: string;
  errorMessage?: string;
}

interface VIESResult {
  status: 'ok' | 'not_found' | 'error' | 'timeout';
  checkedAt: string;
  data?: VIESResponse;
  error?: string;
}

/**
 * Check VAT number validity using VIES
 *
 * @param countryCode - ISO 2-letter country code (e.g., 'EL' for Greece)
 * @param vatNumber - VAT number without country code (e.g., '123456789')
 * @param timeout - Request timeout in milliseconds (default: 8000)
 * @returns VIES validation result
 */
export async function checkVATVIES(
  countryCode: string,
  vatNumber: string,
  timeout: number = 8000
): Promise<VIESResult> {
  const startTime = Date.now();

  try {
    // VIES JSON API (unofficial but more convenient than SOAP)
    // Alternative: use official SOAP API
    const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: countryCode.toUpperCase(),
        vatNumber: vatNumber,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[VIES] HTTP ${response.status}: ${response.statusText}`);
      return {
        status: 'error',
        checkedAt: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    // Successful response
    if (data.valid === true) {
      return {
        status: 'ok',
        checkedAt: new Date().toISOString(),
        data: {
          valid: true,
          countryCode: data.countryCode || countryCode,
          vatNumber: data.vatNumber || vatNumber,
          requestDate: data.requestDate || new Date().toISOString(),
          name: data.name,
          address: data.address,
        },
      };
    }

    // VAT not found
    return {
      status: 'not_found',
      checkedAt: new Date().toISOString(),
      error: 'VAT number not found in VIES',
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`[VIES] Timeout after ${timeout}ms`);
      return {
        status: 'timeout',
        checkedAt: new Date().toISOString(),
        error: `Timeout after ${timeout}ms`,
      };
    }

    console.error('[VIES] Error:', error.message);
    return {
      status: 'error',
      checkedAt: new Date().toISOString(),
      error: error.message,
    };
  }
}

/**
 * Alternative: VIES SOAP API using vat-validation library
 *
 * Note: For production, consider using a library like 'vat-validation' or 'validate-vat'
 * npm install vat-validation
 */
export async function checkVATVIES_SOAP(
  countryCode: string,
  vatNumber: string
): Promise<VIESResult> {
  // TODO: Implement SOAP API call if REST API is unreliable
  // For now, fallback to REST API
  return checkVATVIES(countryCode, vatNumber);
}

/**
 * Check Greek AFM using VIES
 *
 * @param afm - Greek tax number (9 digits)
 * @returns VIES validation result
 */
export async function checkGreekAFM_VIES(afm: string): Promise<VIESResult> {
  // Greece country code in VIES is 'EL' (not 'GR')
  return checkVATVIES('EL', afm);
}

/**
 * Retry logic with exponential backoff
 *
 * VIES can be unstable, so retry once after 2 seconds
 */
export async function checkVATVIES_WithRetry(
  countryCode: string,
  vatNumber: string
): Promise<VIESResult> {
  const result = await checkVATVIES(countryCode, vatNumber);

  // Retry only on timeout or server error
  if (result.status === 'timeout' || result.status === 'error') {
    console.log('[VIES] Retrying after 2 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return checkVATVIES(countryCode, vatNumber, 10000); // Longer timeout on retry
  }

  return result;
}
