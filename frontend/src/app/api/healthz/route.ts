import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get('deep') === '1';

  const basicAuth = process.env.BASIC_AUTH === '1';
  const devMailbox = process.env.SMTP_DEV_MAILBOX === '1';

  // Basic health check (fast, for PM2 polling)
  const response: Record<string, unknown> = {
    status: 'ok',
    basicAuth,
    devMailbox,
    ts: new Date().toISOString(),
  };

  // Deep health check: test DB connectivity (use ?deep=1)
  if (deep) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.db = 'connected';
    } catch {
      response.db = 'error';
      response.status = 'degraded';
    }
  }

  return NextResponse.json(response);
}
