import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // SECURITY: Block in production unless DIXIS_DEV override
  const isProd = process.env.DIXIS_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (isProd && process.env.DIXIS_DEV !== '1') {
    return new NextResponse('Not found', { status: 404 });
  }

  // Rate limiting: 3/5min per IP
  const { rateLimit, rlHeaders } = await import('@/lib/rl/db');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  const rl = await rateLimit('dev-deliver', ip, 3, 300, 1);
  if (!rl.ok) {
    return new NextResponse(
      JSON.stringify({ error: 'Πολλές αιτήσεις. Δοκιμάστε ξανά σε λίγο.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders(rl) } }
    );
  }

  const { deliverQueued } = await import('@/lib/notify/deliver');
  const res = await deliverQueued(20);
  return NextResponse.json({ delivered: res }, { headers: rlHeaders(rl) });
}
