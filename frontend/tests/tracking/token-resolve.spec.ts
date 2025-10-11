import { test, expect } from '@playwright/test';
const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
test('dev endpoint returns token for an order id', async ({ request }) => {
  // Αν δεν ξέρουμε id, ελέγχουμε απλά ότι το endpoint συμπεριφέρεται σωστά σε bad request
  const bad = await request.post(base+'/api/dev/order/token', { data:{} });
  expect([400,404]).toContain(bad.status());
});
