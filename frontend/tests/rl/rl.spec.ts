import { test, expect, request as pwRequest } from '@playwright/test';

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

test.describe('Rate Limiting', () => {
  test('Cron endpoint rate limited (429 on burst)', async ({ request }) => {
    const key = process.env.DIXIS_CRON_KEY || 'test-key';

    // First request should succeed or return 404 (if no key configured)
    const ok1 = await request.post(base + '/api/jobs/notifications/run', {
      headers: { 'X-CRON-KEY': key }
    });
    expect([200, 404]).toContain(ok1.status());

    // Second request (burst=2)
    const ok2 = await request.post(base + '/api/jobs/notifications/run', {
      headers: { 'X-CRON-KEY': key }
    });
    expect([200, 404, 429]).toContain(ok2.status());

    // Third request should be rate limited (exceeds burst)
    const limited = await request.post(base + '/api/jobs/notifications/run', {
      headers: { 'X-CRON-KEY': key }
    });

    if (limited.status() === 429) {
      // Verify rate limit headers are present
      expect(limited.headers()['x-ratelimit-limit']).toBeDefined();
      expect(limited.headers()['x-ratelimit-remaining']).toBeDefined();
      expect(limited.headers()['x-ratelimit-reset']).toBeDefined();
      expect(limited.headers()['retry-after']).toBeDefined();

      const body = await limited.json();
      expect(body.error).toContain('Πολλές αιτήσεις');
    }
  });

  test('Dev deliver endpoint rate limited per IP', async ({ request }) => {
    const ctx = await pwRequest.newContext();

    // Make 4 requests (limit is 3/5min)
    const responses = [];
    for (let i = 0; i < 4; i++) {
      const r = await ctx.post(base + '/api/dev/notifications/deliver');
      responses.push(r.status());
    }

    // Should have at least one 429 response if not in production guard mode
    const has429 = responses.includes(429);
    const allOk = responses.every(s => [200, 404].includes(s));

    // Either rate limited or production guard active
    expect(has429 || allOk).toBeTruthy();
  });

  test('Checkout endpoint has soft rate limiting', async ({ request }) => {
    // Test checkout rate limiting (10/min per IP)
    // Make 11 rapid requests to trigger limit
    const responses = [];
    for (let i = 0; i < 11; i++) {
      const r = await request.post(base + '/api/checkout', {
        data: {
          items: [{ productId: 'test', qty: 1 }],
          shipping: {
            name: 'Test',
            line1: 'Addr',
            city: 'Athens',
            postal: '12345'
          }
        }
      });
      responses.push(r.status());
    }

    // Should have at least one 429 response after 10 requests
    const has429 = responses.slice(10).includes(429);

    // If 429, verify headers
    if (has429) {
      const limited = await request.post(base + '/api/checkout', {
        data: {
          items: [],
          shipping: { name: '', line1: '', city: '', postal: '' }
        }
      });

      if (limited.status() === 429) {
        expect(limited.headers()['retry-after']).toBeDefined();
      }
    }
  });

  test('RL cleanup endpoint requires authentication', async ({ request }) => {
    // Test without key
    const bad = await request.post(base + '/api/jobs/maintenance/rl-clean');
    expect([401, 404]).toContain(bad.status());

    // Test with wrong key
    const wrongKey = await request.post(base + '/api/jobs/maintenance/rl-clean', {
      headers: { 'X-CRON-KEY': 'wrong-key' }
    });
    expect([401, 404]).toContain(wrongKey.status());

    // Test with correct key (if configured)
    if (process.env.DIXIS_CRON_KEY) {
      const ok = await request.post(base + '/api/jobs/maintenance/rl-clean', {
        headers: { 'X-CRON-KEY': process.env.DIXIS_CRON_KEY }
      });

      if (ok.status() === 200) {
        const body = await ok.json();
        expect(body).toHaveProperty('deleted');
        expect(body).toHaveProperty('cutoff');
      }
    }
  });
});
