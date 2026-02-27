import { NextResponse } from 'next/server';
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer';
import { getLaravelInternalUrl } from '@/env';

/**
 * Proxy GET /api/producer/analytics/orders → Laravel
 *
 * FIX-PRODUCER-AUTH-01: Replaced requireProducer() + Bearer token with Sanctum cookie forwarding.
 * Producers use Sanctum session cookies (not dixis_jwt), so the old pattern always returned 401.
 */
export async function GET() {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const res = await fetch(`${getLaravelInternalUrl()}/producer/analytics/orders`, {
      headers: {
        'Accept': 'application/json',
        'Cookie': auth.cookieHeader,
        'Referer': 'https://dixis.gr',
        'Origin': 'https://dixis.gr',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('[producer/analytics/orders] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
