import { test, expect } from '@playwright/test';

test('shipping quote API returns valid numbers for common methods', async ({ request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
  const r1 = await request.get(base+'/api/shipping/quote?method=COURIER&subtotal=20');
  expect(r1.status()).toBe(200);
  const j1 = await r1.json();
  expect(j1.ok).toBeTruthy();
  expect(typeof j1.cost).toBe('number');

  const r2 = await request.get(base+'/api/shipping/quote?method=COURIER_COD&subtotal=20');
  expect(r2.status()).toBe(200);
  const j2 = await r2.json();
  expect(j2.breakdown.cod).toBeGreaterThanOrEqual(0);
});
