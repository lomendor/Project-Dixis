import { test, expect } from '@playwright/test';

/**
 * Commission preview endpoint should return 401/403/404 when:
 * - No auth token provided (auth:sanctum → 401)
 * - commission_engine_v1 flag is OFF (controller → 404)
 * - Order doesn't exist (model binding → 404)
 *
 * Previously quarantined (SMOKE-COMMISSION-QUARANTINE-01, 2026-01-27):
 * Backend was missing settleForOrder() method, causing 500.
 * Fixed in ARCH-FIX-05 (PR #3239): added method + error handling.
 */
test('commission-preview endpoint guarded when flag OFF', async ({ request }) => {
  const base = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://dixis.gr';

  // Use a benign order id; endpoint should be hidden (401/404) when flag OFF or no auth
  const res = await request.get(`${base}/api/orders/123/commission-preview`, { timeout: 45000 });
  expect([401, 403, 404]).toContain(res.status());
});
