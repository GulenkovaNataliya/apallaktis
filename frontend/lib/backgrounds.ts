/**
 * Background page utilities
 * Manages cycling through page-01.webp to page-08.webp
 */

/**
 * Get background page image path by index
 * Cycles through 8 pages: after page-08 returns to page-01
 *
 * @param index - Page index (1-based, will cycle through 1-8)
 * @returns Path to background image
 *
 * @example
 * getBackgroundPage(1) // '/pages/page-01.webp'
 * getBackgroundPage(8) // '/pages/page-08.webp'
 * getBackgroundPage(9) // '/pages/page-01.webp' (cycles back)
 * getBackgroundPage(10) // '/pages/page-02.webp'
 */
export function getBackgroundPage(index: number): string {
  // Ensure index is at least 1
  const safeIndex = Math.max(1, index);

  // Calculate page number (1-8, cycling)
  const pageNum = ((safeIndex - 1) % 8) + 1;

  // Format with leading zero (01, 02, etc.)
  const pageStr = String(pageNum).padStart(2, '0');

  return `/pages/page-${pageStr}.webp`;
}

/**
 * Get special background page by name
 *
 * @param name - Special page name ('pay' or 'objekt')
 * @returns Path to special background image
 */
export function getSpecialPage(name: 'pay' | 'objekt'): string {
  return `/pages/page-${name}.webp`;
}

/**
 * Preload background images for better performance
 * Call this on app initialization
 */
export function preloadBackgrounds(): void {
  if (typeof window === 'undefined') return;

  // Preload all 8 cycling backgrounds
  for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = getBackgroundPage(i);
  }

  // Preload special pages
  const specialPages: Array<'pay' | 'objekt'> = ['pay', 'objekt'];
  specialPages.forEach(name => {
    const img = new Image();
    img.src = getSpecialPage(name);
  });
}
