import { test, expect } from '@playwright/test';

test('Home renders without console errors & shows EL texts', async ({ page }) => {
  const errs: string[] = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => {
    if (m.type() === 'error') errs.push(m.text());
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText(/Dixis|Καλώς/i);
  expect(errs, 'console/page errors should be empty').toEqual([]);
});
