import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';

export function usePageAnalytics(pageTitle?: string) {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    // Track page view on mount and pathname changes
    trackPageView(
      pathname,
      pageTitle || document.title,
      user?.id?.toString()
    );
  }, [pathname, pageTitle, user?.id, trackPageView]);
}