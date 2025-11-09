export async function register() {
  // Φορτώνει τη σωστή config ανά runtime
  // Next θα καλέσει αυτόματα το register στο startup (App Router).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  } else {
    await import('./sentry.client.config');
  }
}
