import { test, expect, request } from '@playwright/test';
const candidates = ['https://dixis.gr','https://dixis.io'];
test('healthz is healthy', async () => {
  const api = await request.newContext();
  let ok=false;
  for (const base of candidates) {
    try {
      const res = await api.get(`${base}/api/healthz`);
      if (res.ok()) { ok=true; break; }
    } catch {}
  }
  expect(ok).toBeTruthy();
});
