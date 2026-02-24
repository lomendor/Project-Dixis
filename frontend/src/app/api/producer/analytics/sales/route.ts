import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies';
import { cookies } from 'next/headers';
import { getLaravelInternalUrl } from '@/env';

/** Proxy GET /api/producer/analytics/sales → Laravel (with proper OTP auth) */
export async function GET(req: NextRequest) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily';
    const limit = searchParams.get('limit') || '30';

    const backendUrl = new URL(`${getLaravelInternalUrl()}/producer/analytics/sales`);
    backendUrl.searchParams.set('period', period);
    backendUrl.searchParams.set('limit', limit);

    const res = await fetch(backendUrl.toString(), {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('[producer/analytics/sales] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
