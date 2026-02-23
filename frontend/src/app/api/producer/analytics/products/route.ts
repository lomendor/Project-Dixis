import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { cookies } from 'next/headers';
import { getLaravelInternalUrl } from '@/env';

/** Proxy GET /api/producer/analytics/products → Laravel (with proper OTP auth) */
export async function GET(req: NextRequest) {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';

    const backendUrl = new URL(`${getLaravelInternalUrl()}/producer/analytics/products`);
    backendUrl.searchParams.set('limit', limit);

    const res = await fetch(backendUrl.toString(), {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('[producer/analytics/products] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
