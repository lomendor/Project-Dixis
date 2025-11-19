'use client';
import { useEffect } from 'react';
import { isIOS } from '@/lib/isIOS';

export default function IOSGuard(): null {
  useEffect(() => {
    if (!isIOS()) return;

    try {
      document.body.classList.add('ios-products-safe');

      // Disable service workers on iOS (potential reload loops)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(regs => regs.forEach(r => r.unregister()))
          .catch(() => {});
      }

      // Reduce reflow loop chances
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    } catch {}
  }, []);

  return null;
}
