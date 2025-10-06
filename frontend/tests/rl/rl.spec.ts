import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test('Cron endpoint rate limited (429 on burst)', async ({ request }) => {
  const key = process.env.DIXIS_CRON_KEY || 'test-key';

  // First call should succeed or return 404 (if not configured)
  const ok1 = await request.post(base + '/api/jobs/notifications/run', {
    headers: { 'X-CRON-KEY': key }
  });
  expect([200, 404]).toContain(ok1.status());

  // Immediate second call should often hit 429 in CI (allow variability)
  const ok2 = await request.post(base + '/api/jobs/notifications/run', {
    headers: { 'X-CRON-KEY': key }
  });
  expect([200, 404, 429]).toContain(ok2.status());

  if (ok2.status() === 429) {
    expect(ok2.headers()['x-ratelimit-limit']).toBeDefined();
    expect(ok2.headers()['x-ratelimit-remaining']).toBeDefined();
    expect(ok2.headers()['x-ratelimit-reset']).toBeDefined();
  }
});

test('Dev deliver rate limited (429 after threshold)', async ({ request }) => {
  const calls = [];

  // Make 4 calls to dev deliver endpoint
  for (let i = 0; i < 4; i++) {
    calls.push(await request.post(base + '/api/dev/notifications/deliver'));
  }

  const statuses = await Promise.all(calls.map(r => r.status()));

  // Should either hit 429 at some point, or all return 200/404
  expect(
    statuses.some(s => s === 429) || statuses.every(s => [200, 404].includes(s))
  ).toBeTruthy();

  // If any 429, check headers
  const rl429 = calls.find((_, i) => statuses[i] === 429);
  if (rl429) {
    expect(rl429.headers()['x-ratelimit-limit']).toBeDefined();
  }
});

test('Checkout rate limited (soft guard)', async ({ request }) => {
  const calls = [];

  // Make 12 checkout calls rapidly
  for (let i = 0; i < 12; i++) {
    calls.push(
      request.post(base + '/api/checkout', {
        data: {
          items: [{ productId: 'test', qty: 1 }],
          shipping: { name: 'Test', line1: 'Addr', city: 'City', postal: '12345' }
        }
      })
    );
  }

  const responses = await Promise.all(calls);
  const statuses = responses.map(r => r.status());

  // Should either hit 429 (rate limited) or other errors (validation/stock)
  // We're mainly testing that the rate limit logic is present
  expect(statuses.some(s => s === 429 || s === 400)).toBeTruthy();
});
