/**
 * Pass 50 - E2E Tests for Zone-Based Shipping Pricing
 *
 * Tests the zone-based shipping quote API and UI integration.
 * Uses route mocking for deterministic API responses.
 */
import { test, expect } from '@playwright/test';

// Helper: Add item to cart via localStorage
async function addItemToCart(page: any) {
  await page.addInitScript(() => {
    const cartState = {
      state: {
        items: {
          '1': {
            id: '1',
            title: 'Ελληνικό Μέλι',
            priceCents: 1500, // €15.00
            qty: 2
          }
        }
      },
      version: 0
    };
    localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
  });
}

test.describe('Pass 50: Zone-Based Shipping', () => {

  test('Athens postal shows Athens zone price', async ({ page }) => {
    await addItemToCart(page);

    // Mock the zone shipping quote API
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');

      // Athens zone response
      if (body.postal_code?.startsWith('10') || body.postal_code?.startsWith('11')) {
        await route.fulfill({
          status: 200,
          json: {
            price_eur: 3.50,
            zone_name: 'Αττική',
            zone_id: 1,
            method: body.method,
            free_shipping: false,
            source: 'zone',
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill postal code for Athens
    await page.getByTestId('checkout-postal').fill('10564');

    // Wait for quote to be fetched
    await page.waitForTimeout(500);

    // Verify zone info is displayed
    const zoneInfo = page.getByTestId('zone-info');
    await expect(zoneInfo).toBeVisible();
    await expect(zoneInfo).toContainText('Αττική');
  });

  test('Islands postal shows higher price', async ({ page }) => {
    await addItemToCart(page);

    // Mock the zone shipping quote API
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');

      // Islands zone response (Mykonos 84600)
      if (body.postal_code?.startsWith('84') || body.postal_code?.startsWith('85')) {
        await route.fulfill({
          status: 200,
          json: {
            price_eur: 7.00,
            zone_name: 'Νησιά',
            zone_id: 4,
            method: body.method,
            free_shipping: false,
            source: 'zone',
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill postal code for Mykonos (island)
    await page.getByTestId('checkout-postal').fill('84600');

    // Wait for quote
    await page.waitForTimeout(500);

    // Verify islands zone is shown
    const zoneInfo = page.getByTestId('zone-info');
    await expect(zoneInfo).toBeVisible();
    await expect(zoneInfo).toContainText('Νησιά');
  });

  test('free shipping over threshold still works', async ({ page }) => {
    // Add items worth more than €35
    await page.addInitScript(() => {
      const cartState = {
        state: {
          items: {
            '1': {
              id: '1',
              title: 'Premium Olive Oil',
              priceCents: 4000, // €40.00 - over threshold
              qty: 1
            }
          }
        },
        version: 0
      };
      localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
    });

    // Mock API to return free shipping
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          price_eur: 0.00,
          zone_name: null,
          method: 'HOME',
          free_shipping: true,
          free_shipping_reason: 'threshold',
          threshold: 35,
          source: 'threshold',
        }
      });
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill valid postal
    await page.getByTestId('checkout-postal').fill('10564');

    // Verify free shipping message is shown
    const freeShippingMsg = page.getByTestId('free-shipping-message');
    await expect(freeShippingMsg).toBeVisible();
    await expect(freeShippingMsg).toContainText('Δωρεάν');
  });

  test('PICKUP remains free regardless of postal code', async ({ page }) => {
    await addItemToCart(page);

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Select PICKUP
    await page.getByTestId('shipping-option-PICKUP').click();

    // Verify PICKUP shows free
    const shippingCostDisplay = page.getByTestId('shipping-cost-display');
    await expect(shippingCostDisplay).toContainText('Δωρεάν');
  });

  test('graceful fallback when API fails', async ({ page }) => {
    await addItemToCart(page);

    // Mock API to fail
    await page.route('**/api/v1/public/shipping/quote', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill valid postal
    await page.getByTestId('checkout-postal').fill('10564');

    // Wait a bit for the failed request
    await page.waitForTimeout(500);

    // Verify shipping cost still shows (fallback value)
    const shippingCostDisplay = page.getByTestId('shipping-cost-display');
    await expect(shippingCostDisplay).toBeVisible();
    // Should show hardcoded fallback price €3.50
    await expect(shippingCostDisplay).toContainText('3');
  });
});
