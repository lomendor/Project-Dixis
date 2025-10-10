import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test.describe('Shipping transparency', () => {
  test('Shipping format helpers work correctly', async () => {
    // Test that helper library exports are functional
    const { labelFor, costFor } = await import('../../src/lib/shipping/format');

    // Test labelFor
    expect(labelFor('HOME')).toBe('Παράδοση στο σπίτι');
    expect(labelFor('LOCKER')).toBe('Παράδοση σε locker');
    expect(labelFor('STORE_PICKUP')).toBe('Παραλαβή από κατάστημα');
    expect(labelFor(undefined)).toBe('Παράδοση στο σπίτι'); // default

    // Test costFor
    expect(costFor('STORE_PICKUP', 10)).toBe(0);
    expect(costFor('HOME', 10)).toBe(3.5); // base cost for HOME
    expect(costFor('HOME', 30)).toBe(0); // free shipping over threshold
    expect(costFor('LOCKER', 10)).toBe(2.0); // base cost for LOCKER
  });
});

test.describe('Shipping display (TODO - requires schema changes)', () => {
  test.skip('Order page shows shipping method label', async ({ page }) => {
    // TODO: This test requires adding shippingMethod field to Order schema
    // Currently Order model has no shipping method field
    // Directive says "no schema changes", so this is documented as future work
    await page.goto(base);
  });

  test.skip('Checkout shows shipping method label', async ({ page }) => {
    // TODO: This test requires checkout page to have shipping method selection
    // Currently no checkout/summary page found with shipping method display
    await page.goto(base);
  });
});
