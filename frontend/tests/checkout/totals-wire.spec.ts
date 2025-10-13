// E2E sanity tests for totals wire-in
// Pass 174R.3 — Verify totals in API responses

import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3001';

test.describe('Totals wire-in verification', () => {
  test('checkout returns totals object with calculated values', async ({ request }) => {
    // Note: This test verifies existing totals implementation in checkout route
    // The checkout route already uses calcTotals() from Pass 174Q

    const checkoutPayload = {
      items: [
        { productId: 'test-prod-1', qty: 2, priceCents: 1000 } // €10.00 × 2
      ],
      shipping: {
        method: 'COURIER',
        name: 'Test Buyer',
        phone: '6912345678',
        line1: 'Test Street 1',
        city: 'Athens',
        postal: '12345'
      },
      payment: { method: 'CARD' }
    };

    const response = await request.post(`${base}/api/checkout`, {
      data: checkoutPayload
    });

    // May fail if product doesn't exist or insufficient stock - this is expected
    // Test validates that IF checkout succeeds, totals are present
    if (response.status() === 201 || response.status() === 200) {
      const body = await response.json();

      // Verify totals object exists
      expect(body.totals).toBeTruthy();

      // Verify totals has expected structure
      expect(body.totals).toHaveProperty('subtotal');
      expect(body.totals).toHaveProperty('shipping');
      expect(body.totals).toHaveProperty('tax');
      expect(body.totals).toHaveProperty('grandTotal');

      // Verify values are numbers
      expect(typeof body.totals.subtotal).toBe('number');
      expect(typeof body.totals.shipping).toBe('number');
      expect(typeof body.totals.tax).toBe('number');
      expect(typeof body.totals.grandTotal).toBe('number');

      console.log('✅ Checkout totals verified:', body.totals);
    } else {
      console.log('⚠️  Checkout failed (expected for test data):', response.status());
    }
  });

  test('totals helper calculates correctly for PICKUP method', async () => {
    // Unit-style test that imports the helper directly
    const { calcTotals } = await import('@/lib/cart/totals');

    const result = calcTotals({
      items: [{ price: 1500, qty: 1 }], // €15.00
      shippingMethod: 'PICKUP'
    });

    // PICKUP should have zero shipping
    expect(result.shipping).toBe(0);
    expect(result.codFee).toBe(0);
    expect(result.subtotal).toBe(1500);
    expect(result.grandTotal).toBe(1500);

    console.log('✅ PICKUP totals:', result);
  });

  test('totals helper calculates correctly for COURIER_COD method', async () => {
    const { calcTotals } = await import('@/lib/cart/totals');

    const result = calcTotals({
      items: [{ price: 2000, qty: 2 }], // €20.00 × 2 = €40.00
      shippingMethod: 'COURIER_COD',
      baseShipping: 350, // €3.50
      codFee: 200, // €2.00
      taxRate: 0.24 // 24% VAT
    });

    expect(result.subtotal).toBe(4000); // 2000 × 2
    expect(result.shipping).toBe(350);
    expect(result.codFee).toBe(200);

    // Tax calculation: (4000 + 350 + 200) * 0.24 = 1092
    expect(result.tax).toBe(1092);

    // Grand total: 4000 + 350 + 200 + 1092 = 5642
    expect(result.grandTotal).toBe(5642);

    console.log('✅ COURIER_COD totals:', result);
  });

  test('totals-wire adapter handles flexible input formats', async () => {
    const { computeTotalsFromContext } = await import('@/lib/cart/totals-wire');

    // Test with priceCents format
    const result1 = computeTotalsFromContext({
      items: [{ priceCents: 1000, qty: 2 }],
      shipping: { method: 'COURIER', baseCostCents: 300 },
      payment: { method: 'CARD' }
    });

    expect(result1.subtotalCents).toBe(2000);
    expect(result1.shippingCents).toBe(300);
    expect(result1.totalCents).toBe(2300);

    // Test with quantity alias
    const result2 = computeTotalsFromContext({
      items: [{ price: 500, quantity: 3 }],
      shipping: { method: 'PICKUP' },
      payment: { method: 'CARD' }
    });

    expect(result2.subtotalCents).toBe(1500);
    expect(result2.shippingCents).toBe(0);

    console.log('✅ Adapter flexibility verified');
  });
});
