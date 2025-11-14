import { NextResponse } from 'next/server';
import os from 'os';
import { prisma } from '@/lib/db/client';

export const runtime = 'nodejs';

function commit() {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch { return process.env.COMMIT_SHA || null; }
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
