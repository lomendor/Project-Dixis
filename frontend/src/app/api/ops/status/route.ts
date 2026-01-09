import { NextResponse } from 'next/server';
import os from 'os';
import { prisma } from '@/lib/db/client';

export const runtime = 'nodejs';

// Security hardening: removed execSync, use build-time env only
function commit() {
  return process.env.COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null;
}

export async function GET() {
  let dbOk = false, dbLatency = -1;
  const t0 = Date.now();
  try { await prisma.$queryRaw`SELECT 1`; dbOk = true; } catch {}
  dbLatency = Date.now() - t0;

  return NextResponse.json({
    ok: true,
    env: process.env.NODE_ENV,
    pid: process.pid,
    node: process.version,
    host: os.hostname(),
    uptime_s: Math.round(process.uptime()),
    mem_rss_mb: Math.round(process.memoryUsage().rss/1024/1024),
    commit: commit(),
    db: { ok: dbOk, latency_ms: dbLatency },
    ts: new Date().toISOString()
  });
}
