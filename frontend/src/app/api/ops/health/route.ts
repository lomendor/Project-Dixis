import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let db = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch {}
  const version = process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
  return NextResponse.json({ db, errors_24h: 0, version });
}
