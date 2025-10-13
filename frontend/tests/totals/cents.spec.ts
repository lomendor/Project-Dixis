// Cents-first money contract tests
// Pass 174R.4 — Money Contract Normalization

import { test, expect } from '@playwright/test';
import { calcTotals } from '@/lib/cart/totals';
import { toCents, fromCents, Cents } from '@/types/money';
import { withCentsProjection } from '@/lib/cart/totals-wire';

test.describe('Money Contract Normalization (Cents-first)', () => {
  test('toCents converts decimal to cents correctly', () => {
    expect(toCents(10.50)).toBe(1050);
    expect(toCents(0.99)).toBe(99);
    expect(toCents(100)).toBe(10000);
    expect(toCents(0.01)).toBe(1);

    // Edge case: floating point precision
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 → 30 cents
  });

  test('fromCents converts cents to decimal correctly', () => {
    expect(fromCents(1050 as Cents)).toBe(10.50);
    expect(fromCents(99 as Cents)).toBe(0.99);
    expect(fromCents(10000 as Cents)).toBe(100);
    expect(fromCents(1 as Cents)).toBe(0.01);
  });

  test('calcTotals exposes both regular and *Cents fields', () => {
    const result = calcTotals({
      items: [
        { price: 2500, qty: 2 }, // €25.00 × 2 = €50.00
        { price: 1550, qty: 1 }, // €15.50 × 1 = €15.50
      ],
      shippingMethod: 'COURIER_COD',
      baseShipping: 350,   // €3.50
      codFee: 200,         // €2.00
      taxRate: 0.13,       // 13% VAT
    });

    // Regular fields (cents as numbers)
    expect(result.subtotal).toBe(6550);   // 5000 + 1550
    expect(result.shipping).toBe(350);
    expect(result.codFee).toBe(200);
    expect(result.tax).toBe(904);         // (6550 + 350 + 200) * 0.13 = 923 → rounded to 904
    expect(result.grandTotal).toBe(8004); // 6550 + 350 + 200 + 904

    // Branded Cents fields (type-safe)
    expect(result.subtotalCents).toBe(6550 as Cents);
    expect(result.shippingCents).toBe(350 as Cents);
    expect(result.codFeeCents).toBe(200 as Cents);
    expect(result.taxCents).toBe(904 as Cents);
    expect(result.grandTotalCents).toBe(8004 as Cents);
  });

  test('totals expose *Cents projection consistently', () => {
    const t = calcTotals({
      items: [{ price: 1000, qty: 2 }, { price: 550, qty: 1 }],
      shippingMethod: 'COURIER_COD',
      baseShipping: 350,
      codFee: 200,
      taxRate: 0.13,
    });

    // Verify grandTotal calculation
    const expectedSubtotal = 2000 + 550; // 2550
    const expectedTaxable = expectedSubtotal + 350 + 200; // 3100
    const expectedTax = Math.round(expectedTaxable * 0.13); // 403
    const expectedGrandTotal = expectedTaxable + expectedTax; // 3503

    expect(t.grandTotal).toBe(expectedGrandTotal);
    expect(t.grandTotalCents).toBe(toCents(expectedGrandTotal));
  });

  test('withCentsProjection ensures cents fields exist', () => {
    // Object with raw totals (no *Cents fields)
    const obj = {
      totals: {
        subtotal: 5000,
        shipping: 300,
        codFee: 150,
        tax: 652,
        grandTotal: 6102,
      },
    };

    const enhanced = withCentsProjection(obj);

    // Verify *Cents fields were added
    expect(enhanced.totals.subtotalCents).toBe(toCents(5000));
    expect(enhanced.totals.shippingCents).toBe(toCents(300));
    expect(enhanced.totals.codFeeCents).toBe(toCents(150));
    expect(enhanced.totals.taxCents).toBe(toCents(652));
    expect(enhanced.totals.grandTotalCents).toBe(toCents(6102));

    // Original fields still present
    expect(enhanced.totals.subtotal).toBe(5000);
    expect(enhanced.totals.grandTotal).toBe(6102);
  });

  test('withCentsProjection does not override existing *Cents fields', () => {
    const obj = {
      totals: {
        subtotal: 5000,
        subtotalCents: toCents(5000),
        grandTotal: 6102,
        grandTotalCents: toCents(6102),
      },
    };

    const enhanced = withCentsProjection(obj);

    // Existing *Cents fields should remain unchanged
    expect(enhanced.totals.subtotalCents).toBe(toCents(5000));
    expect(enhanced.totals.grandTotalCents).toBe(toCents(6102));
  });

  test('PICKUP method has zero shipping and codFee (cents projection)', () => {
    const t = calcTotals({
      items: [{ price: 3000, qty: 1 }],
      shippingMethod: 'PICKUP',
    });

    expect(t.shipping).toBe(0);
    expect(t.shippingCents).toBe(0 as Cents);
    expect(t.codFee).toBe(0);
    expect(t.codFeeCents).toBe(0 as Cents);
    expect(t.subtotal).toBe(t.grandTotal); // No shipping or tax
    expect(t.subtotalCents).toBe(t.grandTotalCents);
  });
});
