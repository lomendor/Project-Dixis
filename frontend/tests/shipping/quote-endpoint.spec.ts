/**
 * E2E test: POST /api/checkout/quote endpoint
 */

import { test, expect, request } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3001';

test('POST /api/checkout/quote returns ok & trace', async () => {
  const ctx = await request.newContext();
  const r = await ctx.post(base + '/api/checkout/quote', {
    data: {
      postalCode: '10557',
      method: 'COURIER',
      subtotal: 30,
      items: [
        { qty: 2, weightKg: 0.8, lengthCm: 30, widthCm: 20, heightCm: 10 },
      ],
    },
  });
  expect([200, 201]).toContain(r.status());
  const j = await r.json();
  expect(j.ok).toBeTruthy();
  expect(j.quote.ruleTrace.length).toBeGreaterThan(0);
});
