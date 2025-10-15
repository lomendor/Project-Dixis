import { test, expect, request } from '@playwright/test';

async function quote(ctx: any, payload: any, baseURL?: string) {
  const res = await ctx.post(`${baseURL ?? ''}/api/checkout/quote`, {
    data: payload,
    headers: { 'content-type': 'application/json' },
  });
  return res;
}

test.describe('shipping quote smoke', () => {
  test('Athens 10431 → COURIER 0.5kg', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await quote(ctx, {
      postalCode: '10431',
      method: 'COURIER',
      items: [{ weightGrams: 500, lengthCm: 20, widthCm: 15, heightCm: 10 }],
      subtotal: 25
    }, baseURL);
    expect(res.status()).toBeLessThan(400);
    const j = await res.json();
    expect(j.zone).toBeTruthy();
    expect(j.chargeableKg).toBeGreaterThan(0);
    expect(Array.isArray(j.ruleTrace)).toBeTruthy();
    expect(typeof j.shippingCost).toBe('number');
  });

  test('Thessaloniki 54622 → COURIER_COD 2×1.2kg', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await quote(ctx, {
      postalCode: '54622',
      method: 'COURIER_COD',
      items: [{ weightGrams: 1200 }, { weightGrams: 1200 }],
      subtotal: 38
    }, baseURL);
    expect(res.status()).toBeLessThan(400);
    const j = await res.json();
    expect(j.zone).toBeTruthy();
    expect(j.chargeableKg).toBeGreaterThan(0);
    expect(Array.isArray(j.ruleTrace)).toBeTruthy();
    expect(typeof j.shippingCost).toBe('number');
  });

  test('Island 85100 (Rhodes) → PICKUP 0.3kg', async ({ baseURL }) => {
    const ctx = await request.newContext();
    const res = await quote(ctx, {
      postalCode: '85100',
      method: 'PICKUP',
      items: [{ weightGrams: 300 }],
      subtotal: 12
    }, baseURL);
    expect(res.status()).toBeLessThan(400);
    const j = await res.json();
    expect(j.zone).toBeTruthy();
    expect(j.chargeableKg).toBeGreaterThan(0);
    expect(Array.isArray(j.ruleTrace)).toBeTruthy();
    expect(typeof j.shippingCost).toBe('number');
  });
});
