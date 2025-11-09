import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    tracesSampleRate: 0.2, // perf traces (adjust later)
    replaysSessionSampleRate: 0.0, // enable later if θέλουμε Session Replay
    replaysOnErrorSampleRate: 0.0,
    environment: process.env.NODE_ENV,
    enabled: true,
  });
}
