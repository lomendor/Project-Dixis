import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const key = req.headers.get('x-cron-key') || '';
  if (!process.env.DIXIS_CRON_KEY || key !== process.env.DIXIS_CRON_KEY) {
    return new NextResponse('Not found', { status: 404 });
  }
  const { deliverDue } = await import('@/lib/notify/worker');
  const res = await deliverDue(20);
  return NextResponse.json({ processed: res.length, results: res });
}
