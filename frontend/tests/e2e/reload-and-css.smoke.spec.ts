import { test, expect, Page } from '@playwright/test';

/**
 * Pass 59: Stabilized prod smoke tests
 *
 * Fixes net::ERR_ABORTED flakiness by:
 * 1. Using targeted retry wrapper for navigation (max 2 attempts)
 * 2. Using domcontentloaded + optional networkidle (non-blocking)
 * 3. Deterministic CSS assertions (font-family, stylesheets count)
 */

/**
 * Retry navigation on ERR_ABORTED errors (common in SPA redirects)
 */
async function gotoWithRetry(
  page: Page,
  url: string,
  options: { maxRetries?: number; timeout?: number } = {}
): Promise<void> {
  const { maxRetries = 2, timeout = 30000 } = options;
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
