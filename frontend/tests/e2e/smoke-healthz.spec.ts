import { test, expect } from '@playwright/test';

test('healthz is healthy', async ({ request }) => {
  const base = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://dixis.gr';
  const res = await request.get(`${base}/api/healthz`, { timeout: 45000 });
  expect(res.status(), 'healthz status').toBe(200);
  const json = await res.json();
  // Accept both "ok" and "healthy" status values
  expect(['ok', 'healthy']).toContain(json.status);
});
