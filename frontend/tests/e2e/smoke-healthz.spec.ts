import { test, expect } from '@playwright/test';

test('healthz is healthy', async ({ request }) => {
  const base = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://dixis.io';
  const res = await request.get(`${base}/api/healthz`, { timeout: 15000 });
  expect(res.status(), 'healthz status').toBe(200);
  const json = await res.json();
  expect(json.status).toBe('healthy');
});
