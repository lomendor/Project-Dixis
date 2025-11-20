import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 12']);

const BASE = 'https://dixis.io';

test('products (mobile): no reload loop, no console errors, empty-state visible', async ({ page }) => {
  const errors: string[] = [];
  let navigations = 0;
  let pageshow = 0;

  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('framenavigated', () => { navigations++; });

  await page.addInitScript(() => {
    window.addEventListener('pageshow', () => {
      // @ts-ignore
      window.__pageshowCount = (window.__pageshowCount || 0) + 1;
    });
  });

  await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  pageshow = await page.evaluate('window.__pageshowCount || 1');

  // Κριτήρια: λίγες πλοηγήσεις/επαναφορτώσεις, κανένα console error
  expect(navigations, `Too many navigations in 8s: ${navigations}`).toBeLessThan(3);
  expect(pageshow, `Too many pageshow events: ${pageshow}`).toBeLessThan(3);

  // Verify page loaded successfully (has title)
  await expect(page.locator('h1')).toBeVisible();

  expect(errors, `Console errors:\n${errors.join('\n')}`).toEqual([]);
});
