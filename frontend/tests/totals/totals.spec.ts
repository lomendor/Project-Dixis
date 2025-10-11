import { test, expect } from '@playwright/test';
import { calcTotals, fmtEUR } from '@/lib/cart/totals';

test('COD courier totals formatted EL', async () => {
  const t = calcTotals({
    items:[{price:10,qty:2},{price:5.5,qty:1}],
    shippingMethod:'COURIER_COD',
    baseShipping:3.5, codFee:2.0, taxRate:0.13
  });
  expect(t.subtotal).toBeCloseTo(25.5, 2);
  expect(t.shipping).toBeCloseTo(3.5, 2);
  expect(t.codFee).toBeCloseTo(2.0, 2);
  expect(t.tax).toBeCloseTo(3.32, 2); // 25.5 * 0.13
  expect(t.grandTotal).toBeCloseTo(34.32, 2);
  expect(fmtEUR(t.grandTotal)).toMatch(/€\s?34,32|34,32\s?€/);
});

test('Pickup no shipping/tax', async () => {
  const t = calcTotals({
    items:[{price:4.2,qty:1}],
    shippingMethod:'PICKUP',
  });
  expect(t.subtotal).toBeCloseTo(4.2, 2);
  expect(t.shipping).toBeCloseTo(0, 2);
  expect(t.codFee).toBeCloseTo(0, 2);
  expect(t.tax).toBeCloseTo(0, 2);
  expect(t.grandTotal).toBeCloseTo(4.2, 2);
});
