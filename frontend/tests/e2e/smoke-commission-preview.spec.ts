import { test, expect } from '@playwright/test';

/**
 * Expect 404 on production because commission_engine_v1 is OFF by default.
 * (When we enable on staging later, we will override BASE_URL in CI to hit staging and expect 200.)
 */
test('commission-preview endpoint guarded when flag OFF', async ({ request }) => {
  const base = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://dixis.gr';
  // Use a benign order id; endpoint should be hidden (404) when flag OFF
  const res = await request.get(`${base}/api/orders/123/commission-preview`, { timeout: 45000 });
  expect([401, 403, 404]).toContain(res.status());
});
