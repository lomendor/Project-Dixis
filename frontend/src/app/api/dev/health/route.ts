// Dev health endpoint (dev-only)
// Pass 174Q — Quick-Wins Triad

import { NextResponse } from 'next/server';
import { getRequestId } from '@/lib/observability/request';

export async function GET() {
  // Return 404 in production
  if (process.env.DIXIS_ENV === 'production') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const requestId = getRequestId();
  const payload = {
    ok: true,
    env: process.env.DIXIS_ENV || 'development',
    requestId,
    time: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'x-request-id': requestId,
    },
  });
}
