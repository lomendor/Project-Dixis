import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } }); // iPhone-ish

const BASE = 'https://dixis.io';

test('products-demo renders cards and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto(`${BASE}/products-demo`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Products (Demo)' })).toBeVisible();

  // Περιμένουμε να φορτώσει το demo JSON και να εμφανιστούν κάρτες
  await page.waitForTimeout(1500);
  const cards = await page.locator('article').count();
  expect(cards).toBeGreaterThanOrEqual(6);

  expect(errors, `Console errors on /products-demo: ${errors.join('\n')}`).toEqual([]);
});
