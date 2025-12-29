/**
 * Pass 63: Readiness helper for smoke tests
 *
 * Polls /api/healthz with exponential backoff before running smoke tests.
 * Prevents flaky failures when production is cold-starting or temporarily slow.
 */
import { request } from '@playwright/test';

interface ReadinessOptions {
  baseUrl: string;
  maxAttempts?: number;      // Default: 6 (~60s total with backoff)
  initialDelayMs?: number;   // Default: 2000
  maxDelayMs?: number;       // Default: 15000
  timeoutMs?: number;        // Per-request timeout. Default: 10000
}

interface ReadinessResult {
  ready: boolean;
  attempts: number;
  totalTimeMs: number;
  lastError?: string;
}

/**
 * Wait for production to be ready by polling /api/healthz
 * Uses exponential backoff: 2s, 4s, 8s, 15s, 15s, 15s (max ~60s total)
 */
export async function waitForReadiness(options: ReadinessOptions): Promise<ReadinessResult> {
  const {
    baseUrl,
    maxAttempts = 6,
    initialDelayMs = 2000,
    maxDelayMs = 15000,
    timeoutMs = 10000,
  } = options;

  const healthzUrl = `${baseUrl}/api/healthz`;
  const startTime = Date.now();
  let attempts = 0;
  let lastError: string | undefined;

  console.log(`🔍 Readiness check: ${healthzUrl}`);

  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    const delay = Math.min(initialDelayMs * Math.pow(2, i), maxDelayMs);

    try {
      const ctx = await request.newContext();
      const res = await ctx.get(healthzUrl, { timeout: timeoutMs });

      if (res.ok()) {
        const totalTimeMs = Date.now() - startTime;
        console.log(`✅ Production ready after ${attempts} attempt(s), ${totalTimeMs}ms`);
        await ctx.dispose();
        return { ready: true, attempts, totalTimeMs };
      }

      lastError = `HTTP ${res.status()}`;
      await ctx.dispose();
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    // Don't wait after last attempt
    if (i < maxAttempts - 1) {
      console.log(`   Attempt ${attempts}/${maxAttempts} failed (${lastError}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const totalTimeMs = Date.now() - startTime;
  console.log(`❌ Production not ready after ${attempts} attempts, ${totalTimeMs}ms`);
  return { ready: false, attempts, totalTimeMs, lastError };
}

/**
 * Simple readiness check with generous timeout (for globalSetup)
 */
export async function checkHealthz(baseUrl: string, timeoutMs = 15000): Promise<boolean> {
  try {
    const ctx = await request.newContext();
    const res = await ctx.get(`${baseUrl}/api/healthz`, { timeout: timeoutMs });
    await ctx.dispose();
    return res.ok();
  } catch {
    return false;
  }
}
