import { test, expect, Page } from '@playwright/test';
import { waitForReadiness } from './helpers/readiness';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://dixis.gr';

/**
 * Pass 59: Stabilized prod smoke tests
 * Pass 63: Added readiness gate to prevent cold-start timeouts
 *
 * Fixes net::ERR_ABORTED flakiness by:
 * 1. Waiting for production to be ready (healthz check)
 * 2. Using targeted retry wrapper for navigation (max 2 attempts)
 * 3. Using domcontentloaded + optional networkidle (non-blocking)
 * 4. Deterministic CSS assertions (font-family, stylesheets count)
 */

// Generous timeout for smoke tests against production
test.setTimeout(120_000);

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

/**
 * Retry navigation on ERR_ABORTED errors (common in SPA redirects)
 */
async function gotoWithRetry(
  page: Page,
  url: string,
  options: { maxRetries?: number; timeout?: number } = {}
): Promise<void> {
  // Pass 63: Increased timeout to 60s (was 30s) after readiness gate warms up site
  const { maxRetries = 2, timeout = 60000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      // Optional: wait for network to settle (non-blocking)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      return;
    } catch (err) {
      lastError = err as Error;
      const isAborted = lastError.message.includes('ERR_ABORTED') ||
                        lastError.message.includes('net::ERR_ABORTED');
      if (!isAborted || attempt === maxRetries) {
        throw lastError;
      }
      // Brief pause before retry
      await page.waitForTimeout(500);
    }
  }
}

test('homepage: styles applied & no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      // Ignore network errors (covered by navigation retry)
      const text = msg.text();
      if (!text.includes('net::') && !text.includes('ERR_')) {
        errors.push(text);
      }
    }
  });

  await gotoWithRetry(page, '/');

  // Verify page loaded with stable selector
  await expect(page.locator('main, body').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Προϊόντα').first()).toBeVisible({ timeout: 10000 });

  // CSS assertions: stylesheets loaded
  const styleCount = await page.evaluate(() => document.styleSheets.length);
  expect(styleCount).toBeGreaterThan(0);

  // CSS assertions: font-family applied (deterministic check)
  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily || '');
  expect(fontFamily.length).toBeGreaterThan(0);

  // No unexpected console errors
  expect(errors, `Console errors on /: ${errors.join('\n')}`).toEqual([]);
});

test('products: no infinite reload loop (8s window)', async ({ page }) => {
  let navigations = 0;
  page.on('framenavigated', () => { navigations++; });

  await gotoWithRetry(page, '/products');

  // Wait 8s to detect reload loops
  await page.waitForTimeout(8000);

  // Allow up to 2 navigations (initial + possible redirect)
  expect(navigations).toBeLessThan(3);
});
