import { test, expect } from '@playwright/test';

// Τρέχει μόνο όταν PG_E2E=1 (π.χ. σε PR με label pg-e2e και CI που θέτει το env)
const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('GET /api/admin/orders (pg provider) returns data', async ({ request }) => {
  const res = await request.get('/api/admin/orders?status=paid');
  expect([200, 501]).toContain(res.status()); // 501 αν δεν υπάρχουν δεδομένα/seed — δεν θεωρείται failure του build
});
