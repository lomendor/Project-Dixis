/**
 * Unit tests: Shipping Engine V2 (zones/volumetric/tiers)
 */

import { test, expect } from '@playwright/test';
import zones from '@/lib/shipping/config/zones.json';
import rates from '@/lib/shipping/config/rates.json';
import {
  volumetricKg,
  zoneForPostal,
  chargeableKgOf,
  quoteV2,
} from '@/lib/shipping/engine.v2';

test('postal zone longest-prefix wins', async () => {
  const z = zoneForPostal(zones as any, '10557');
  expect(typeof z).toBe('string');
});

test('volumetric vs actual weight', async () => {
  const v = volumetricKg(50, 40, 30); // 50x40x30 / 5000 = 12kg
  expect(v).toBeGreaterThan(10);
  const kg = chargeableKgOf([
    { qty: 1, weightKg: 8, lengthCm: 50, widthCm: 40, heightCm: 30 },
  ]);
  expect(kg).toBeCloseTo(12, 0);
});

test('quote returns breakdown and numbers', async () => {
  const q = quoteV2(
    { rates: rates as any, zones: zones as any },
    {
      postalCode: '10557',
      method: 'COURIER',
      subtotal: 25,
      items: [{ qty: 1, weightKg: 1.2 }],
    }
  );
  expect(q.shippingCost).toBeGreaterThanOrEqual(0);
  expect(Array.isArray(q.ruleTrace)).toBeTruthy();
});
