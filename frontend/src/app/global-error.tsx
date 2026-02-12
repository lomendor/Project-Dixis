'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {}
  }, [error]);

  return (
    <html>
      <body className="p-4">
        <h1>Κάτι πήγε στραβά</h1>
        <p>Παρακαλούμε δοκιμάστε ξανά.</p>
      </body>
    </html>
  );
}
