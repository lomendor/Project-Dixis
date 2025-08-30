import { useEffect } from 'react';

export function usePageAnalytics(title: string) {
  useEffect(() => {
    // Track page view (placeholder for analytics)
    if (typeof window !== 'undefined') {
      document.title = title;
      console.log(`Page Analytics: ${title}`);
    }
  }, [title]);
}