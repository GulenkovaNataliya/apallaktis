/**
 * Formatting utilities
 */

/**
 * Format number as Euro currency in European format
 * Example: 1000.50 -> "1.000,50 €"
 *
 * @param amount - Number to format
 * @returns Formatted string with Euro symbol
 */
export function formatEuro(amount: number): string {
  // Use European locale formatting (Greece)
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse European formatted number string to number
 * Example: "1.000,50" -> 1000.50
 *
 * @param value - String to parse
 * @returns Parsed number
 */
export function parseEuroInput(value: string): number {
  // Remove spaces and Euro symbol
  let cleaned = value.replace(/\s/g, '').replace(/€/g, '');

  // Replace dots (thousand separators) with nothing
  cleaned = cleaned.replace(/\./g, '');

  // Replace comma (decimal separator) with dot
  cleaned = cleaned.replace(/,/g, '.');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
