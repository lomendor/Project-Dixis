import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

test('products pagination preserves URL state', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${base}/products?page=2&per_page=20`, { waitUntil: 'domcontentloaded' });

  // Verify page loaded successfully
  const h1 = page.locator('h1');
  await expect(h1).toContainText(/Προϊόντα/i);

  // Verify pagination controls exist
  const nextButton = page.locator('a:has-text("Επόμενη")');
  await expect(nextButton).toBeVisible();

  // Verify URL state is preserved
  const url = page.url();
  expect(url).toContain('page=2');
  expect(url).toContain('per_page=20');

  // Verify no console errors
  expect(errors, 'console should be clean').toEqual([]);
});
