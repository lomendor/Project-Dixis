import { test, expect } from '@playwright/test';

test('GET /api/products returns 200 and JSON contract', async ({ request }) => {
  const res = await request.get('/api/products');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json).toHaveProperty('items');
  expect(json).toHaveProperty('page');
  expect(json).toHaveProperty('pageSize');
  expect(json).toHaveProperty('total');
  expect(Array.isArray(json.items)).toBeTruthy();
});
