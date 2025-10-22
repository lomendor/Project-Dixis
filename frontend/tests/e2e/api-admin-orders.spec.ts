import { test, expect } from '@playwright/test';

test('GET /api/admin/orders?demo=1 returns all', async ({ request }) => {
  const res = await request.get('/api/admin/orders?demo=1');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(Array.isArray(json.items)).toBeTruthy();
  expect(json.count).toBe(json.items.length);
  expect(json.items.length).toBeGreaterThan(0);
});

test('GET /api/admin/orders?demo=1&status=paid filters correctly', async ({ request }) => {
  const res = await request.get('/api/admin/orders?demo=1&status=paid');
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.items.length).toBeGreaterThan(0);
  for (const it of json.items) {
    expect(it.status).toBe('paid');
  }
});

test('GET /api/admin/orders?demo=1&status=INVALID returns 400', async ({ request }) => {
  const res = await request.get('/api/admin/orders?demo=1&status=oops');
  expect(res.status()).toBe(400);
});
