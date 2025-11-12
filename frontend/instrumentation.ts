import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_PUBLIC_MSW === '1' && typeof window !== 'undefined') {
    const { worker } = await import('./tests/msw/browser')
    worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

export async function onRequestError(error: unknown, request: Request, context: Record<string, unknown>) {
  Sentry.captureRequestError(error as Error, request as any, context as any);
}