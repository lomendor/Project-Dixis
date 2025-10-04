import { test, expect, request } from '@playwright/test';

test('[seo] <title> exists in initial HTML', async () => {
  const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
  const r = await request.newContext();
  const res = await r.get(base);
  const html = await res.text();
  expect(html).toMatch(/<title>[^<]+<\/title>/i);
});
