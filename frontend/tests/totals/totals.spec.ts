import { test, expect } from '@playwright/test';
import { calcTotals, fmtEUR } from '@/lib/cart/totals';

test('COD courier totals with EL formatting', () => {
  const result = calcTotals({
    items: [
      { price: 2500, qty: 2 }, // €25.00 × 2 = €50.00
    ],
    shippingMethod: 'COURIER_COD',
    baseShipping: 350, // €3.50
    codFee: 150, // €1.50
    taxRate: 0.24, // 24% VAT
  });

  expect(result.subtotal).toBe(5000); // 2500 × 2
  expect(result.shipping).toBe(350);
  expect(result.codFee).toBe(150);
  expect(result.tax).toBe(1320); // (5000 + 350 + 150) * 0.24 = 1320
  expect(result.grandTotal).toBe(6820); // 5000 + 350 + 150 + 1320 = 6820

  // Verify EL formatting (Greek locale uses comma for decimals)
  const formattedSubtotal = fmtEUR(result.subtotal);
  const formattedShipping = fmtEUR(result.shipping);
  const formattedCodFee = fmtEUR(result.codFee);
  const formattedTax = fmtEUR(result.tax);
  const formattedGrandTotal = fmtEUR(result.grandTotal);

  expect(formattedSubtotal).toMatch(/50[,\.]00/);
  expect(formattedShipping).toMatch(/3[,\.]50/);
  expect(formattedCodFee).toMatch(/1[,\.]50/);
  expect(formattedTax).toMatch(/13[,\.]20/);
  expect(formattedGrandTotal).toMatch(/68[,\.]20/);

  console.log('✅ COD totals:', formattedGrandTotal);
});

test('Pickup with no shipping/tax', () => {
  const result = calcTotals({
    items: [
      { price: 1500, qty: 2 }, // €15.00 × 2 = €30.00
    ],
    shippingMethod: 'PICKUP',
  });

  expect(result.subtotal).toBe(3000);
  expect(result.shipping).toBe(0);
  expect(result.codFee).toBe(0);
  expect(result.tax).toBe(0);
  expect(result.grandTotal).toBe(3000);

  // Verify EL formatting
  const formattedSubtotal = fmtEUR(result.subtotal);
  const formattedGrandTotal = fmtEUR(result.grandTotal);

  expect(formattedSubtotal).toMatch(/30[,\.]00/);
  expect(formattedGrandTotal).toMatch(/30[,\.]00/);

  console.log('✅ Pickup totals:', formattedGrandTotal);
});
