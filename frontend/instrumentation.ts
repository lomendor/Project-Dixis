import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_PUBLIC_MSW === '1' && typeof window !== 'undefined') {
    const { worker } = await import('./tests/msw/browser')
    worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

// Fix warning: provide onRequestError using captureRequestError
export const onRequestError: Instrumentation.onRequestError = (...args) => {
  try { Sentry.captureRequestError(...args); } catch { /* no-op */ }
};