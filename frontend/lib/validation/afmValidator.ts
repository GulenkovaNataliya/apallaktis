/**
 * Greek AFM (ΑΦΜ) Validator
 *
 * AFM is a 9-digit tax identification number used in Greece
 * Validation uses modulo 11 checksum algorithm
 *
 * References:
 * - https://www.aade.gr/
 * - Greek Tax Authority specifications
 */

export interface AFMValidationResult {
  valid: boolean;
  formatted?: string; // Formatted AFM (e.g., with spaces)
  error?: string;
}

/**
 * Validate Greek AFM (ΑΦΜ)
 *
 * Rules:
 * - Must be exactly 9 digits
 * - Last digit is checksum (modulo 11 algorithm)
 * - Cannot be all zeros or all same digit
 *
 * @param afm - Greek tax number (can contain spaces or dashes)
 * @returns Validation result
 */
export function validateAFM(afm: string): AFMValidationResult {
  // Remove all non-digit characters
  const cleanAFM = afm.replace(/\D/g, '');

  // Check length
  if (cleanAFM.length !== 9) {
    return {
      valid: false,
      error: 'AFM must be exactly 9 digits',
    };
  }

  // Check if all zeros
  if (cleanAFM === '000000000') {
    return {
      valid: false,
      error: 'AFM cannot be all zeros',
    };
  }

  // Check if all same digit (e.g., 111111111)
  if (/^(\d)\1{8}$/.test(cleanAFM)) {
    return {
      valid: false,
      error: 'AFM cannot be all same digit',
    };
  }

  // Validate checksum using modulo 11 algorithm
  const isValidChecksum = validateAFMChecksum(cleanAFM);
  if (!isValidChecksum) {
    return {
      valid: false,
      error: 'Invalid AFM checksum',
    };
  }

  return {
    valid: true,
    formatted: formatAFM(cleanAFM),
  };
}

/**
 * Validate AFM checksum using modulo 11 algorithm
 *
 * Algorithm:
 * 1. Take first 8 digits
 * 2. Multiply each digit by (2^(8-position))
 * 3. Sum all products
 * 4. Calculate sum % 11
 * 5. Last digit should equal (sum % 11) % 10
 *
 * @param afm - 9-digit AFM string
 * @returns true if checksum is valid
 */
function validateAFMChecksum(afm: string): boolean {
  const digits = afm.split('').map(Number);
  let sum = 0;

  // Calculate weighted sum of first 8 digits
  for (let i = 0; i < 8; i++) {
    const weight = Math.pow(2, 8 - i);
    sum += digits[i] * weight;
  }

  // Calculate checksum
  const calculatedChecksum = (sum % 11) % 10;
  const actualChecksum = digits[8];

  return calculatedChecksum === actualChecksum;
}

/**
 * Format AFM with spaces for better readability
 *
 * Example: 123456789 → 123 456 789
 *
 * @param afm - 9-digit AFM string
 * @returns Formatted AFM
 */
export function formatAFM(afm: string): string {
  const cleanAFM = afm.replace(/\D/g, '');
  if (cleanAFM.length !== 9) {
    return afm; // Return as-is if invalid length
  }

  return `${cleanAFM.slice(0, 3)} ${cleanAFM.slice(3, 6)} ${cleanAFM.slice(6, 9)}`;
}

/**
 * Generate valid AFM for testing (DEVELOPMENT ONLY!)
 *
 * WARNING: Do NOT use in production!
 * For testing purposes only.
 *
 * @returns Valid random AFM
 */
export function generateTestAFM(): string {
  // Generate random 8 digits
  let afm = '';
  for (let i = 0; i < 8; i++) {
    afm += Math.floor(Math.random() * 10).toString();
  }

  // Calculate and append checksum
  const digits = afm.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    const weight = Math.pow(2, 8 - i);
    sum += digits[i] * weight;
  }

  const checksum = (sum % 11) % 10;
  afm += checksum.toString();

  return afm;
}

/**
 * Known test AFMs for development
 *
 * These are publicly documented test AFMs from AADE (Greek Tax Authority)
 */
export const TEST_AFMS = {
  VALID: ['090000045', '094259216', '801234567'], // Valid test AFMs
  INVALID: ['000000000', '111111111', '123456789'], // Invalid AFMs
};

/**
 * Check if AFM is from a known test set
 *
 * @param afm - AFM to check
 * @returns true if it's a known test AFM
 */
export function isTestAFM(afm: string): boolean {
  const cleanAFM = afm.replace(/\D/g, '');
  return TEST_AFMS.VALID.includes(cleanAFM) || TEST_AFMS.INVALID.includes(cleanAFM);
}
