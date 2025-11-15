import { test, expect } from '@playwright/test';

// Disabled by default; enable with SMOKE_CHECKOUT=1 to exercise the flow.
test.skip(!process.env.SMOKE_CHECKOUT, 'Disabled unless SMOKE_CHECKOUT=1');

test('Checkout smoke (skeleton)', async ({ page, request }) => {
  // Health probe
  const res = await request.get('/api/healthz');
  expect(res.ok()).toBeTruthy();

  // Base navigation (non-invasive)
  await page.goto('/');
  await expect(page).toHaveTitle(/Dixis|Δixis|Marketplace/i);

  // NOTE: Intentionally minimal. Real clicks enabled later when test IDs are stable.
});
