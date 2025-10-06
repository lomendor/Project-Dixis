import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.DIXIS_DEV !== '1') {
    return new NextResponse('Not found', { status: 404 });
  }

  // Rate limiting: 3/5min per IP/session
  const { rateLimit, rlHeaders } = await import('@/lib/rl/db');
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'local';
  const rl = await rateLimit('dev-deliver', String(ip), 3, 300, 1);
  if (!rl.ok) {
    return new NextResponse(
      JSON.stringify({ error: 'Πολλές αιτήσεις στο dev deliver.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders(rl) } }
    );
  }

  const { deliverQueued } = await import('@/lib/notify/deliver');
  const res = await deliverQueued(20);
  return NextResponse.json({ delivered: res });
}
