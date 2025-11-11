import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    throw new Error('DIXIS Sentry test error');
  } catch (e) {
    try {
      Sentry.captureException(e);
    } catch {}
    return NextResponse.json({ ok: false, sentry: true });
  }
}
