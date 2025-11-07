import { test, expect, request } from '@playwright/test';

const BASE =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.BASE_URL ||
  'http://localhost:3000';

test.setTimeout(60_000);

test('healthz returns 200', async () => {
  const ctx = await request.newContext();
  const res = await ctx.get(`${BASE}/api/healthz`, { timeout: 10_000 });
  expect(res.ok()).toBeTruthy();
});

test('landing renders & shows brand text', async ({ page }) => {
  const resp = await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  expect(resp?.ok()).toBeTruthy();
  await expect(page.locator('body')).toContainText(/Dixis|Φρέσκα|Fresh Products/i);
});
