import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

test('products page renders grid without console errors', async ({ page }) => {
  const errors: string[] = [];
  
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`${base}/products`, { waitUntil: 'domcontentloaded' });
  
  const h1 = page.locator('h1');
  await expect(h1).toContainText(/Προϊόντα/i);
  
  expect(errors, 'console should be clean').toEqual([]);
});
