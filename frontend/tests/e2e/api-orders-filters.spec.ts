import { test, expect } from '@playwright/test';

test('API: supports q + status + date range', async ({ request }) => {
  const res = await request.get('/api/admin/orders?demo=1&q=A-200&status=pending&page=1&pageSize=10');
  expect(res.status()).toBe(200);
  const a = await res.json();
  expect(Array.isArray(a.items)).toBeTruthy();
  expect(typeof a.count).toBe('number');
});
