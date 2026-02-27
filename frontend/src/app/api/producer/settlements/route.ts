import { NextResponse } from 'next/server';
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer';
import { getLaravelInternalUrl } from '@/env';

/**
 * Pass PAYOUT-04: Proxy GET /api/producer/settlements → Laravel
 *
 * FIX-PRODUCER-AUTH-01: Replaced requireProducer() + Bearer token with Sanctum cookie forwarding.
 * Producers use Sanctum session cookies (not dixis_jwt), so the old pattern always returned 401.
 */
export async function GET() {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const res = await fetch(`${getLaravelInternalUrl()}/producer/settlements`, {
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
    console.error('[producer/settlements] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
