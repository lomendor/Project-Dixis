import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// ── Critical env vars that must be set in production ──────────────────────
const CRITICAL_ENV_VARS = [
  'DATABASE_URL',
  'INTERNAL_API_URL',
  'NEXT_PUBLIC_API_BASE_URL',
] as const;

// ── Load deploy metadata (written by prod-deploy-clean.sh) ────────────────
function getDeployMeta(): { sha: string; deployedAt: string } | null {
  try {
    // Try multiple locations (standalone vs dev)
    const paths = [
      join(process.cwd(), '.deploy-meta.json'),
      join(process.cwd(), '..', '.deploy-meta.json'),
    ];
    for (const p of paths) {
      try {
        const raw = readFileSync(p, 'utf-8');
        return JSON.parse(raw);
      } catch {
        // Try next path
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const deep = url.searchParams.get('deep') === '1';

  const basicAuth = process.env.BASIC_AUTH === '1';
  const devMailbox = process.env.SMTP_DEV_MAILBOX === '1';

  // Deploy metadata
  const deployMeta = getDeployMeta();

  // Quick env check: are critical vars set? (existence only, no values)
  const missingEnv = CRITICAL_ENV_VARS.filter(
    (v) => !process.env[v] || process.env[v]!.trim() === ''
  );

  // Basic health check (fast, for PM2 polling)
  const response: Record<string, unknown> = {
    status: 'ok',
    basicAuth,
    devMailbox,
    ts: new Date().toISOString(),
    // Deploy info
    sha: deployMeta?.sha ?? 'unknown',
    deployedAt: deployMeta?.deployedAt ?? 'unknown',
    // Env status
    env: missingEnv.length === 0 ? 'ok' : 'missing',
  };

  // Report which vars are missing (names only, never values)
  if (missingEnv.length > 0) {
    response.missingEnv = missingEnv;
    response.status = 'degraded';
  }

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
