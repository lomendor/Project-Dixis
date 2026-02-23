import { NextResponse } from 'next/server';
import { requireProducer } from '@/lib/auth/requireProducer';
import { cookies } from 'next/headers';
import { getLaravelInternalUrl } from '@/env';

/** Proxy GET /api/producer/analytics/orders → Laravel (with proper OTP auth) */
export async function GET() {
  try {
    await requireProducer();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('dixis_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const res = await fetch(`${getLaravelInternalUrl()}/producer/analytics/orders`, {
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('[producer/analytics/orders] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
