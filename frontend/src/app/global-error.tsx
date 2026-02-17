'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {}
  }, [error]);

  // T4: Branded error page with inline styles (CSS/Tailwind may not load in global-error)
  return (
    <html lang="el-GR">
      <body style={{
        margin: 0,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem',
      }}>
        <div style={{
          maxWidth: '420px',
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          padding: '2.5rem 2rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }} aria-hidden="true">
            🍊
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#171717', margin: '0 0 0.5rem' }}>
            Κάτι πήγε στραβά
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#737373', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Ζητούμε συγγνώμη. Παρουσιάστηκε ένα απρόσμενο σφάλμα.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0 1.5rem',
              }}
            >
              Δοκιμάστε ξανά
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                backgroundColor: 'transparent',
                color: '#525252',
                border: '1px solid #d4d4d4',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '0 1.5rem',
              }}
            >
              Αρχική σελίδα
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
