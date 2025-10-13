import { test, expect } from '@playwright/test';
import { calcTotals, fmtEUR } from '@/lib/cart/totals';

test('COD courier totals with EL formatting', () => {
  const result = calcTotals({
    subtotalCents: 5000, // €50.00
    shippingMethod: 'COURIER_COD',
    shippingCostCents: 350, // €3.50
    codFeeCents: 150, // €1.50
    taxRate: 0.24, // 24% VAT
  });

  expect(result.subtotalCents).toBe(5000);
  expect(result.shippingCents).toBe(350);
  expect(result.codCents).toBe(150);
  expect(result.taxCents).toBe(1320); // (5000 + 350 + 150) * 0.24 = 1320
  expect(result.totalCents).toBe(6820); // 5000 + 350 + 150 + 1320 = 6820

  // Verify EL formatting (Greek locale uses comma for decimals)
  expect(result.subtotalEUR).toMatch(/50[,\.]00/);
  expect(result.shippingEUR).toMatch(/3[,\.]50/);
  expect(result.codEUR).toMatch(/1[,\.]50/);
  expect(result.taxEUR).toMatch(/13[,\.]20/);
  expect(result.totalEUR).toMatch(/68[,\.]20/);

  console.log('✅ COD totals:', result.totalEUR);
});

test('Pickup with no shipping/tax', () => {
  const result = calcTotals({
    subtotalCents: 3000, // €30.00
    shippingMethod: 'PICKUP',
  });

  expect(result.subtotalCents).toBe(3000);
  expect(result.shippingCents).toBe(0);
  expect(result.codCents).toBe(0);
  expect(result.taxCents).toBe(0);
  expect(result.totalCents).toBe(3000);

  // Verify EL formatting
  expect(result.subtotalEUR).toMatch(/30[,\.]00/);
  expect(result.totalEUR).toMatch(/30[,\.]00/);

  console.log('✅ Pickup totals:', result.totalEUR);
});
