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

// ── Required: script FAILS if these are missing ─────────────────────────────
const REQUIRED_VARS = [
  { name: 'DATABASE_URL', hint: 'Neon PostgreSQL connection string' },
  { name: 'NODE_ENV', hint: 'Environment (production/development/test)' },
] as const;

// ── Recommended: script WARNS if these are missing (CI may not have them) ───
const RECOMMENDED_VARS = [
  { name: 'INTERNAL_API_URL', hint: 'Server-side API URL (e.g. https://dixis.gr/api/v1)' },
  { name: 'NEXT_PUBLIC_API_BASE_URL', hint: 'Browser-side API URL' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', hint: 'Stripe publishable key (required if card payments enabled)' },
  { name: 'PORT', hint: 'Server port (usually 3000)' },
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
    const masked = name === 'DATABASE_URL'
      ? value.replace(/\/\/[^@]+@/, '//***@')
      : value;
    pass(name, masked);
  }
}

// Recommended vars: warn only, don't fail
console.log('\n🔔 Recommended Variables (warn only)');
console.log('─'.repeat(50));

for (const { name, hint } of RECOMMENDED_VARS) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${name}: Not set (${hint})`);
  } else {
    pass(name, value);
  }
}

// ── Logical consistency checks ──────────────────────────────────────────────
console.log('\n🔗 Payment Configuration Consistency');
console.log('─'.repeat(50));

const cardEnabled = process.env.NEXT_PUBLIC_PAYMENTS_CARD_FLAG === 'true';
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (cardEnabled && !stripeKey) {
  fail('STRIPE_KEY', 'NEXT_PUBLIC_PAYMENTS_CARD_FLAG=true but NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
} else if (cardEnabled && stripeKey && !stripeKey.startsWith('pk_')) {
  fail('STRIPE_KEY', `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_ (got: ${stripeKey.slice(0, 8)}...)`);
} else if (cardEnabled && stripeKey) {
  pass('Payment config', `Card payments ON, Stripe key: ${stripeKey.slice(0, 12)}...`);
} else {
  pass('Payment config', 'Card payments OFF — Stripe key not required');
}

const isQuick = process.argv.includes('--quick');

// Wrap connectivity checks in async IIFE (top-level await unsupported in CJS/tsx)
(async () => {
  if (!isQuick && failures === 0) {
    // ── Step 2: Test DB connectivity ──────────────────────────────────────
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

    // ── Step 3: Test API reachability (warn-only during deploy) ────────
    console.log('\n🌐 API Reachability');
    console.log('─'.repeat(50));

    const apiUrl = process.env.INTERNAL_API_URL;
    // During deploy, localhost Next.js may be down (no .next dir).
    // Warn instead of fail for self-referencing URLs.
    const isSelfUrl = apiUrl && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(apiUrl);
    if (apiUrl) {
      try {
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
        } else if (isSelfUrl) {
          console.log(`  ⚠️  INTERNAL_API_URL: HTTP ${res.status} (localhost — expected during deploy)`);
        } else {
          fail('INTERNAL_API_URL', `HTTP ${res.status} from ${healthUrl}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isSelfUrl) {
          console.log(`  ⚠️  INTERNAL_API_URL: ${msg.slice(0, 80)} (localhost — expected during deploy)`);
        } else {
          fail('INTERNAL_API_URL', `Unreachable: ${msg.slice(0, 120)}`);
        }
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  if (failures > 0) {
    console.error(`\n💥 VALIDATION FAILED: ${failures} check(s) failed.`);
    console.error('   Fix the issues above before deploying.\n');
    process.exit(1);
  } else {
    console.log(`\n✅ ALL CHECKS PASSED${isQuick ? ' (quick mode — no connectivity)' : ''}\n`);
    process.exit(0);
  }
})();
