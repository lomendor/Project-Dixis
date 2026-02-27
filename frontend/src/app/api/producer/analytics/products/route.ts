import { NextRequest, NextResponse } from 'next/server';
import { verifySanctumProducer } from '@/lib/auth/verifySanctumProducer';
import { getLaravelInternalUrl } from '@/env';

/**
 * Proxy GET /api/producer/analytics/products → Laravel
 *
 * FIX-PRODUCER-AUTH-01: Replaced requireProducer() + Bearer token with Sanctum cookie forwarding.
 * Producers use Sanctum session cookies (not dixis_jwt), so the old pattern always returned 401.
 */
export async function GET(req: NextRequest) {
  const auth = await verifySanctumProducer();
  if (auth.ok === false) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';

    const backendUrl = new URL(`${getLaravelInternalUrl()}/producer/analytics/products`);
    backendUrl.searchParams.set('limit', limit);

    const res = await fetch(backendUrl.toString(), {
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
    console.error('[producer/analytics/products] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
