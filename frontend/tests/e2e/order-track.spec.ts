import { test, expect } from '@playwright/test';

test('orders track API returns 400 without token', async ({ request }) => {
  const r = await request.get('/api/orders/track');
  expect(r.status()).toBe(400);
  const body = await r.json();
  expect(body.error).toBe('Missing token');
});

test('orders track API returns 404 with invalid token', async ({ request }) => {
  const r = await request.get('/api/orders/track?token=invalid-token-12345');
  expect(r.status()).toBe(404);
});
