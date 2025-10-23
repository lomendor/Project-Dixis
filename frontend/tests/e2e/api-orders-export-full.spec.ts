import { test, expect } from '@playwright/test';

test('API: /api/admin/orders/export returns CSV', async ({ request }) => {
  const res = await request.get('/api/admin/orders/export?demo=1&q=A-200');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('text/csv');
  const text = await res.text();
  expect(text).toContain('Order,Πελάτης,Σύνολο,Κατάσταση');
  expect(text.split('\n').length).toBeGreaterThan(1);
});
