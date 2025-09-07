/**
 * MSW Initialization Component
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Initializes Mock Service Worker for development and testing
 * Only loads in development mode to avoid production overhead
 */

'use client';

import { useEffect } from 'react';

export function MSWInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Dynamic import to avoid bundling MSW in production
      import('../mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
          quiet: false,
        }).catch(console.error);
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}