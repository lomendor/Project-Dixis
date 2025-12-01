import { test, expect } from '@playwright/test';

// iPhone 13-like context for WebKit
test.use({
  browserName: 'webkit',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
});

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('products (WebKit iOS emu): no reload loop/jitter', async ({ page }) => {
  let navigations = 0;
  page.on('framenavigated', () => { navigations++; });

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000); // παρατήρηση 9s
  expect(navigations, `Detected ${navigations} navigations in 9s (possible loop)`).toBeLessThan(3);

  // Κανένα μεγάλο console error
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.waitForTimeout(1000);
  expect(errors, `Console errors on /products: ${errors.join('\n')}`).toEqual([]);
});
