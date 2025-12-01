import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

test.describe('mobile safari smokes', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12-ish
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  test('home: no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Dixis/i);
    expect(errors, `Console errors on /: ${errors.join('\n')}`).toEqual([]);
  });

  test('/products: no infinite reload loop', async ({ page }) => {
    let navigations = 0;
    page.on('framenavigated', () => { navigations++; });
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    expect(navigations).toBeLessThan(3); // >3 σε 8s = πιθανό loop
  });
});
