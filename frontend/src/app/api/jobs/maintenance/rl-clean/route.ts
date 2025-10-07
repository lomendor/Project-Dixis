import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: Request) {
  // Security: require X-CRON-KEY authentication
  const key = req.headers.get('x-cron-key') || '';
  if (!process.env.DIXIS_CRON_KEY || key !== process.env.DIXIS_CRON_KEY) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Delete RateLimit records older than 24 hours
  const cutoff = new Date(Date.now() - 24 * 3600_000);
  const result = await prisma.rateLimit.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });

  return NextResponse.json({
    deleted: result.count,
    cutoff: cutoff.toISOString()
  });
}
