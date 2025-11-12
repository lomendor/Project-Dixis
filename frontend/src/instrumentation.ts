import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Φορτώνει τη σωστή config ανά runtime
  // Next θα καλέσει αυτόματα το register στο startup (App Router).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  } else {
    await import('./sentry.client.config');
  }
}

export async function onRequestError(error: unknown, request: Request, context: Record<string, unknown>) {
  Sentry.captureRequestError(error as Error, request, context);
}
