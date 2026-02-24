import { NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies';
import { cookies } from 'next/headers';
import { getLaravelInternalUrl } from '@/env';

/**
 * Pass PAYOUT-04: Proxy GET /api/producer/settlements → Laravel
 *
 * Fixed: Previously read 'auth_token' cookie which is never set by OTP auth.
 * Now uses requireProducer() + 'dixis_session' cookie (same pattern as /api/me/products).
 */
export async function GET() {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${getLaravelInternalUrl()}/producer/settlements`, {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('[producer/settlements] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
