import { test, expect } from '@playwright/test';

test('PG facets aggregation returns correct totals & provider=pg', async ({ request }) => {
  // 1) Seed (CI-only route). Σε CI περνάει χωρίς token.
  const seed = await request.post('/api/ci/seed/orders?dataset=facets-basic');
  expect(seed.status()).toBe(200);
  const seedJson = await seed.json();
  expect(seedJson.ok).toBeTruthy();
  expect(seedJson.total).toBe(10);

  // 2) Κλήση facets API χωρίς demo (θέλουμε PG path)
  const res = await request.get('/api/admin/orders/facets');
  expect(res.status()).toBe(200);
  const json = await res.json();

  // Περιμένουμε PG provider
  expect(json.provider).toBe('pg');

  // Περιμένουμε συγκεκριμένα counts από το seed
  // pending:4, shipped:2, cancelled:1, processing:3 → total:10
  // Επιτρέπουμε επιπλέον keys, αλλά ελέγχουμε τα βασικά
  expect(json.total).toBe(10);
  expect(json.totals.pending).toBe(4);
  expect(json.totals.shipped).toBe(2);
  expect(json.totals.cancelled).toBe(1);
  expect(json.totals.processing).toBe(3);
});
