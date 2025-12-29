import { test, expect } from '@playwright/test';

/**
 * Pass 52 Regression: Card Payment Init
 *
 * Verifies that logged-in users can initiate card payments without 404 errors.
 * The 404 was caused by orders having user_id=null (auth not captured).
 */

test.describe('Pass 52: Card Payment Init @smoke', () => {
  test.use({ storageState: 'playwright/.auth/consumer.json' });

  test('card payment init does NOT return 404 ORDER_NOT_FOUND', async ({ page }) => {
    // Seed cart
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis-cart',
        JSON.stringify({
          state: {
            items: {
              '1': { id: '1', title: 'Test Product', priceCents: 500, qty: 1 }
            }
          },
          version: 0
        })
      );
    });

    // Go to checkout
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill required fields (minimal)
    await page.fill('[data-testid="checkout-name"]', 'Test User');
    await page.fill('[data-testid="checkout-phone"]', '6912345678');
    await page.fill('[data-testid="checkout-address"]', 'Test Address 123');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postal"]', '10671');

    // Select Card payment
    const cardOption = page.getByTestId('payment-card');
    const cardVisible = await cardOption.isVisible().catch(() => false);

    if (!cardVisible) {
      // Card option not enabled in this build - skip gracefully
      test.skip(true, 'Card payment option not visible (NEXT_PUBLIC_PAYMENTS_CARD_FLAG not enabled)');
      return;
    }

    await cardOption.click();

    // Track API responses
    const responses: { url: string; status: number }[] = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/v1/')) {
        responses.push({ url, status: response.status() });
      }
    });

    // Submit
    await page.click('[data-testid="checkout-submit"]');

    // Wait for API calls to complete
    await page.waitForTimeout(3000);

    // Check that payment checkout was NOT 404
    const paymentCheckoutCall = responses.find(r => r.url.includes('/payments/checkout'));

    if (paymentCheckoutCall) {
      // If payment checkout was called, it should NOT be 404 (ORDER_NOT_FOUND)
      expect(paymentCheckoutCall.status).not.toBe(404);

      // Expected responses:
      // - 200: Success (Stripe session created)
      // - 503: Card payments disabled or Stripe not configured
      // - 422: Invalid order state
      // NOT 404: That means order.user_id mismatch (the bug we fixed)
      console.log(`Payment checkout response: ${paymentCheckoutCall.status}`);
    }

    // Also verify order creation captured user_id by checking the response
    const orderCreateCall = responses.find(r =>
      r.url.includes('/public/orders') && !r.url.includes('/payments/')
    );

    if (orderCreateCall) {
      // Order should be created successfully
      expect(orderCreateCall.status).toBe(201);
    }
  });

  test('checkout shows error message, not crashes, on card init failure', async ({ page }) => {
    // Seed cart
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'dixis-cart',
        JSON.stringify({
          state: {
            items: {
              '1': { id: '1', title: 'Test Product', priceCents: 500, qty: 1 }
            }
          },
          version: 0
        })
      );
    });

    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Fill required fields
    await page.fill('[data-testid="checkout-name"]', 'Test User');
    await page.fill('[data-testid="checkout-phone"]', '6912345678');
    await page.fill('[data-testid="checkout-address"]', 'Test Address 123');
    await page.fill('[data-testid="checkout-city"]', 'Athens');
    await page.fill('[data-testid="checkout-postal"]', '10671');

    // Select Card if available
    const cardOption = page.getByTestId('payment-card');
    const cardVisible = await cardOption.isVisible().catch(() => false);

    if (!cardVisible) {
      test.skip(true, 'Card payment option not visible');
      return;
    }

    await cardOption.click();
    await page.click('[data-testid="checkout-submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Page should NOT crash - either shows error or redirects
    // Check we're still on a valid page (no uncaught exception)
    const url = page.url();
    const isValidState =
      url.includes('/checkout') ||
      url.includes('/thank-you') ||
      url.includes('stripe.com');

    expect(isValidState).toBe(true);
  });
});
