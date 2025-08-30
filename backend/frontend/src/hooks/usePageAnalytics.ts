'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/lib/analytics';

export function usePageAnalytics(title?: string) {
  const pathname = usePathname();
  const { trackPageView, setUserId } = useAnalytics();

  useEffect(() => {
    // Track page view
    const pageTitle = title || document?.title || pathname;
    trackPageView(pathname, pageTitle);
  }, [pathname, title, trackPageView]);

  return { setUserId };
}