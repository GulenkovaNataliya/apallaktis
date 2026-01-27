'use client';

import { getBackgroundPage, getSpecialPage } from '@/lib/backgrounds';

interface BackgroundPageProps {
  /** Page index (1-based, will cycle through 1-8) */
  pageIndex?: number;
  /** Special page name instead of numeric index */
  specialPage?: 'pay' | 'objekt';
  /** Content to render on top of the background */
  children?: React.ReactNode;
  /** Optional className for the container */
  className?: string;
}

/**
 * BackgroundPage component
 * Displays a cycling background image (page-01 to page-08) or special page
 * with content rendered on top
 */
export default function BackgroundPage({
  pageIndex = 1,
  specialPage,
  children,
  className = '',
}: BackgroundPageProps) {
  // Get the appropriate background image
  const backgroundSrc = specialPage
    ? getSpecialPage(specialPage)
    : getBackgroundPage(pageIndex);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {/* Background Image - same structure as VideoBackground */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundSrc}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}
