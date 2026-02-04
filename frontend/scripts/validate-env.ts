#!/usr/bin/env node
/**
 * validate-env.ts — Pre-deploy environment validation
 *
 * Checks that all critical env vars exist and services are reachable.
 * Exits with code 1 if ANY check fails, blocking the deploy.
 *
 * Usage:
 *   npx tsx scripts/validate-env.ts          # full check (env + DB + API)
 *   npx tsx scripts/validate-env.ts --quick  # env vars only (no connectivity)
 *
 * Context: Created after Feb 2026 production outage caused by missing
 * DATABASE_URL and INTERNAL_API_URL on VPS.
 */

// Load .env if present (for VPS where .env is a symlink)
import 'dotenv/config';

// ── Required environment variables ──────────────────────────────────────────
const REQUIRED_VARS = [
  { name: 'DATABASE_URL', hint: 'Neon PostgreSQL connection string' },
  { name: 'INTERNAL_API_URL', hint: 'Server-side API URL (e.g. https://dixis.gr/api/v1)' },
  { name: 'NEXT_PUBLIC_API_BASE_URL', hint: 'Browser-side API URL' },
  { name: 'PORT', hint: 'Server port (usually 3000)' },
  { name: 'NODE_ENV', hint: 'Environment (production/development/test)' },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────
let failures = 0;

function pass(label: string, detail?: string) {
  console.log(`  ✅ ${label}${detail ? ` (${detail})` : ''}`);
}

function fail(label: string, detail: string) {
  console.error(`  ❌ ${label}: ${detail}`);
  failures++;
}

// ── Step 1: Check env vars exist and are non-empty ──────────────────────────
console.log('\n🔍 Environment Variable Check');
console.log('─'.repeat(50));

for (const { name, hint } of REQUIRED_VARS) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    fail(name, `Missing or empty. Hint: ${hint}`);
  } else {
    // Mask sensitive values
    const masked = name === 'DATABASE_URL'
      ? value.replace(/\/\/[^@]+@/, '//***@')
      : value;
    pass(name, masked);
  }
}

const isQuick = process.argv.includes('--quick');

if (!isQuick && failures === 0) {
  // ── Step 2: Test DB connectivity ────────────────────────────────────────
  console.log('\n🗄️  Database Connectivity');
  console.log('─'.repeat(50));

  try {
    // Dynamic import to avoid crash if prisma not generated yet
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient({ log: [] });
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();
    if (Array.isArray(result) && result.length > 0) {
      pass('DATABASE_URL', 'SELECT 1 succeeded');
    } else {
      fail('DATABASE_URL', 'Query returned unexpected result');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    fail('DATABASE_URL', `Cannot connect: ${msg.slice(0, 120)}`);
  }

  // ── Step 3: Test API reachability ─────────────────────────────────────
  console.log('\n🌐 API Reachability');
  console.log('─'.repeat(50));

  const apiUrl = process.env.INTERNAL_API_URL;
  if (apiUrl) {
    try {
      // Try fetching products endpoint (or just healthz)
      const healthUrl = apiUrl.replace(/\/api\/v1\/?$/, '/api/v1/public/products?per_page=1');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(healthUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);
      if (res.ok) {
        pass('INTERNAL_API_URL', `HTTP ${res.status} from ${apiUrl}`);
      } else {
        fail('INTERNAL_API_URL', `HTTP ${res.status} from ${healthUrl}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      fail('INTERNAL_API_URL', `Unreachable: ${msg.slice(0, 120)}`);
    }
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
if (failures > 0) {
  console.error(`\n💥 VALIDATION FAILED: ${failures} check(s) failed.`);
  console.error('   Fix the issues above before deploying.\n');
  process.exit(1);
} else {
  console.log(`\n✅ ALL CHECKS PASSED${isQuick ? ' (quick mode — no connectivity)' : ''}\n`);
  process.exit(0);
}
