/**
 * Pass 63: Smoke tests with readiness gate
 *
 * Waits for production /api/healthz before running tests.
 * Prevents flaky failures when production is cold-starting.
 */
import { test, expect, request } from '@playwright/test';
import { waitForReadiness } from './helpers/readiness';

const BASE =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  'http://localhost:3000';

// Generous timeout for smoke tests against production
test.setTimeout(90_000);

// Configure retries for this spec only (CI flakiness mitigation)
test.describe.configure({ retries: 2 });

// Wait for production to be ready before running any tests
test.beforeAll(async () => {
  const result = await waitForReadiness({
    baseUrl: BASE,
    maxAttempts: 6,      // ~60s total with backoff
    initialDelayMs: 2000,
    maxDelayMs: 15000,
    timeoutMs: 15000,    // Per-request timeout
  });

  if (!result.ready) {
    console.warn(`⚠️ Production may be unavailable: ${result.lastError}`);
    // Don't fail here - let individual tests fail with clearer errors
  }
});

test('healthz returns 200', async () => {
  const ctx = await request.newContext();
  // Increased timeout: production may be slow after cold start
  const res = await ctx.get(`${BASE}/api/healthz`, { timeout: 30_000 });
  expect(res.ok()).toBeTruthy();
  await ctx.dispose();
});

test('landing renders & shows brand text', async ({ page }) => {
  // Increased timeout for production navigation
  const resp = await page.goto(`${BASE}/`, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  expect(resp?.ok()).toBeTruthy();
  await expect(page.locator('body')).toContainText(/Dixis|Φρέσκα|Fresh Products/i, {
    timeout: 15_000,
  });
});
