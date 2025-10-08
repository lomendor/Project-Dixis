import { test, expect } from '@playwright/test';

// @smoke — Health endpoint should respond quickly without SSR/DB deps
test('@smoke healthz responds', async ({ request }) => {
  const res = await request.get('/api/healthz', { timeout: 10000 });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.status).toBe('ok');
  expect(typeof json.ts).toBe('string');
});
