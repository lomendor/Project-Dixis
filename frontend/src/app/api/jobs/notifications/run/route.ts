import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const key = req.headers.get('x-cron-key') || '';
  if (!process.env.DIXIS_CRON_KEY || key !== process.env.DIXIS_CRON_KEY) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Rate limiting: 1/min (burst 2), 12/hour by cron key
  const { rateLimit, rlHeaders } = await import('@/lib/rl/db');
  const cronKey = process.env.DIXIS_CRON_KEY || '';
  const rl = await rateLimit('cron-run', cronKey, 1, 60, 2);
  if (!rl.ok) {
    return new NextResponse(
      JSON.stringify({ error: 'Πολλές αιτήσεις στο cron. Δοκιμάστε αργότερα.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders(rl) } }
    );
  }

  const { deliverDue } = await import('@/lib/notify/worker');
  const res = await deliverDue(20);
  return NextResponse.json({ processed: res.length, results: res });
}
