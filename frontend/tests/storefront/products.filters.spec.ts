import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

test('products filters update URL and render without console errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${base}/products`, { waitUntil: 'domcontentloaded' });

  // Fill in search field
  await page.fill('input[name="q"]', 'Ελιές');

  // Check stock filter
  await page.check('input[name="stock"][value="in"]');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/.*\/products\?.*/, { timeout: 5000 });

  // Verify URL contains expected params
  const url = page.url();
  expect(url).toContain('q=');
  expect(url).toContain('stock=in');

  // Verify page loaded successfully
  const h1 = page.locator('h1');
  await expect(h1).toContainText(/Προϊόντα/i);

  // Verify no console errors
  expect(errors, 'console should be clean').toEqual([]);
});
