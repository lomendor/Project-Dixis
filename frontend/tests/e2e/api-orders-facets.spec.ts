import { test, expect } from '@playwright/test';

test('API: /api/admin/orders/facets returns totals & total', async ({ request }) => {
  const res = await request.get('/api/admin/orders/facets?demo=1&q=A-2');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json).toHaveProperty('totals');
  expect(json).toHaveProperty('total');
  const sum = Object.values<number>(json.totals || {}).reduce((a,b)=>a+b,0);
  expect(sum).toBeGreaterThan(0);
  expect(sum).toBeLessThanOrEqual(json.total);
});
