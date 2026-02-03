/**
 * Date utilities for calendar month calculations
 */

/**
 * Adds 1 calendar month to the given date with day clamping.
 *
 * If the target month has fewer days than the original day,
 * returns the last day of the target month.
 *
 * Examples:
 * - Jan 31 → Feb 28/29 (depending on leap year)
 * - Mar 31 → Apr 30
 * - Aug 31 → Sep 30
 * - Feb 29 → Mar 29
 * - Jan 15 → Feb 15 (normal case)
 *
 * @param date - The source date
 * @returns New Date object with 1 calendar month added
 */
export function addCalendarMonthClamped(date: Date): Date {
  const result = new Date(date);
  const originalDay = result.getDate();

  // Add 1 month
  result.setMonth(result.getMonth() + 1);

  // If day changed, overflow occurred (e.g., Jan 31 → Mar 3)
  // Set to last day of the intended month (day 0 = last day of previous month)
  if (result.getDate() !== originalDay) {
    result.setDate(0);
  }

  return result;
}

/**
 * Adds N calendar months to the given date with day clamping.
 *
 * @param date - The source date
 * @param months - Number of months to add
 * @returns New Date object with N calendar months added
 */
export function addCalendarMonths(date: Date, months: number): Date {
  let result = new Date(date);
  for (let i = 0; i < months; i++) {
    result = addCalendarMonthClamped(result);
  }
  return result;
}
