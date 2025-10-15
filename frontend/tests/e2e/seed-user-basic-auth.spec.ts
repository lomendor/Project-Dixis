import { test, expect, request } from '@playwright/test';

test('CI seed user (if seed route exists)', async () => {
  const ctx = await request.newContext();
  const user = { email: 'e2e+user@dixis.local', password: 'pass1234' };
  const res = await ctx.post('/api/ci/seed', { data: { type: 'user', data: user } }).catch(() => null);
  if (!res || res.status() === 404) test.skip(true, 'ci seed route not present');
  expect(res!.status()).toBeLessThan(400);
});
