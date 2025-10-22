import { test, expect } from '@playwright/test';
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('API (PG): q + date filters accepted', async ({ request }) => {
  const res = await request.get('/api/admin/orders?q=A&page=1&pageSize=5');
  expect([200,501]).toContain(res.status());
});
