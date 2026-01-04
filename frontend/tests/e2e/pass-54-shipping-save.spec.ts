/**
 * Pass 54: Shipping Data Save Regression Test
 *
 * Verifies that checkout saves shipping_address and shipping_cost to the order.
 * Bug: Card payment flow was creating orders with shipping_address=null, shipping_cost=0.
 * Fix: Frontend now sends shipping_address and shipping_cost in createOrder payload.
 */
import { test, expect } from '@playwright/test';

test.describe('Pass 54: Shipping Data Save', () => {
  test('@smoke checkout form sends shipping data to API', async ({ page }) => {
    // Intercept the order creation API call
    let capturedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/v1/public/orders', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        capturedPayload = request.postDataJSON();
        // Return mock success response
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 999,
              status: 'pending',
              total_amount: '11.25',
              shipping_method: 'HOME',
              shipping_cost: '3.50',
              shipping_address: capturedPayload?.shipping_address || null,
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock payment checkout endpoint (to prevent redirect)
    await page.route('**/api/v1/public/payments/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          redirect_url: 'https://checkout.stripe.com/test',
          session_id: 'cs_test_mock'
        })
      });
    });

    // Set up cart with test items
    await page.addInitScript(() => {
      localStorage.setItem('dixis:cart:v1', JSON.stringify({
        items: {
          '1': { id: 1, title: 'Test Product', priceCents: 775, qty: 1 }
        },
        version: 1
      }));
    });

    // Go to checkout
    await page.goto('/checkout');
    await page.waitForSelector('[data-testid="checkout-form"]');

    // Fill shipping details
    await page.fill('[data-testid="checkout-name"]', 'Test User');
    await page.fill('[data-testid="checkout-phone"]', '6912345678');
    await page.fill('[data-testid="checkout-email"]', 'test@example.com');
    await page.fill('[data-testid="checkout-address"]', 'Test Street 123');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postal"]', '10671');

    // Select card payment
    const cardRadio = page.locator('[data-testid="payment-card"]');
    if (await cardRadio.isVisible()) {
      await cardRadio.click();
    }

    // Submit form
    await page.click('[data-testid="checkout-submit"]');

    // Wait for API call
    await page.waitForTimeout(1000);

    // Verify payload contains shipping data
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload?.shipping_address).toBeDefined();
    expect(capturedPayload?.shipping_cost).toBeDefined();

    // Verify shipping_address structure
    const shippingAddr = capturedPayload?.shipping_address as Record<string, string>;
    expect(shippingAddr?.name).toBe('Test User');
    expect(shippingAddr?.phone).toBe('6912345678');
    expect(shippingAddr?.line1).toBe('Test Street 123');
    expect(shippingAddr?.city).toBe('Athens');
    expect(shippingAddr?.postal_code).toBe('10671');

    // Verify shipping_cost is not 0
    expect(Number(capturedPayload?.shipping_cost)).toBeGreaterThan(0);
  });

  test('@smoke COD checkout also sends shipping data', async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await page.route('**/api/v1/public/orders', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        capturedPayload = request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 998,
              status: 'pending',
              total_amount: '11.25',
              shipping_method: 'HOME',
              shipping_cost: '3.50',
              shipping_address: capturedPayload?.shipping_address || null,
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem('dixis:cart:v1', JSON.stringify({
        items: {
          '1': { id: 1, title: 'Test Product', priceCents: 775, qty: 1 }
        },
        version: 1
      }));
    });

    await page.goto('/checkout');
    await page.waitForSelector('[data-testid="checkout-form"]');

    await page.fill('[data-testid="checkout-name"]', 'COD User');
    await page.fill('[data-testid="checkout-phone"]', '6987654321');
    await page.fill('[data-testid="checkout-address"]', 'COD Street 456');
    await page.fill('[data-testid="checkout-city"]', 'Thessaloniki');
    await page.fill('[data-testid="checkout-postal"]', '54621');

    // COD is default, just submit
    await page.click('[data-testid="checkout-submit"]');
    await page.waitForTimeout(1000);

    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload?.shipping_address).toBeDefined();
    expect(capturedPayload?.shipping_cost).toBeGreaterThan(0);

    const shippingAddr = capturedPayload?.shipping_address as Record<string, string>;
    expect(shippingAddr?.city).toBe('Thessaloniki');
    expect(shippingAddr?.postal_code).toBe('54621');
  });
});
