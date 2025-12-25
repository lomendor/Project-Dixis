/**
 * Regression test for checkout order ID + consumer order history bugs
 *
 * Root causes:
 * 1. Checkout redirect to /order/undefined when API response doesn't have order ID
 * 2. /account/orders shows empty even though orders exist (wrong data source)
 *
 * Evidence: User reported "Δεν έχετε παραγγελίες ακόμα" after completing checkout
 */
import { test, expect } from '@playwright/test';

test.describe('Checkout → Orders History (Regression)', () => {
  test('checkout success prevents /order/undefined and shows order in history', async ({ page }) => {
    // Navigate to checkout page
    await page.goto('/checkout');

    // Fill checkout form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-email"]').fill('test@example.com');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept checkout API to ensure it returns proper order ID
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          orderId: 'test-order-123',
          totals: {
            subtotal: 10.00,
            shipping: 2.00,
            vat: 2.40,
            total: 14.40
          },
          emailSent: true
        }
      });
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // CRITICAL: Wait for redirect and verify URL does NOT contain "undefined"
    await page.waitForURL('**/order/**', { timeout: 10000 });
    const successUrl = page.url();

    // Assert: Success URL must NOT contain "undefined"
    expect(successUrl).not.toContain('/order/undefined');
    expect(successUrl).not.toContain('undefined');

    // Assert: Success URL should contain the order ID
    expect(successUrl).toContain('test-order-123');

    // Navigate to orders history
    await page.goto('/account/orders');

    // Intercept orders API (Next.js endpoint now, not Laravel)
    await page.route('**/internal/orders', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          orders: [
            {
              id: 123,
              status: 'submitted',
              total_amount: '14.40',
              created_at: new Date().toISOString(),
              payment_method: 'COD',
              shipping_method: 'COURIER',
              items: [
                {
                  id: 1,
                  product_id: 1,
                  product_name: 'Test Product',
                  quantity: 1,
                  price: '10.00',
                  unit_price: '10.00',
                  total_price: '10.00',
                  product_unit: 'kg',
                  product: null
                }
              ],
              order_items: []
            }
          ]
        }
      });
    });

    // Reload to trigger fetch
    await page.reload();

    // Assert: Orders list should show at least one order (NOT empty state)
    await page.waitForSelector('[data-testid="orders-list"]', { timeout: 10000 });
    const emptyState = page.locator('[data-testid="empty-orders-message"]');
    await expect(emptyState).not.toBeVisible();

    // Assert: Order card should be visible
    const orderCard = page.locator('[data-testid="order-card"]').first();
    await expect(orderCard).toBeVisible();

    // Assert: Order status should be visible
    await expect(orderCard.locator('[data-testid="order-status"]')).toBeVisible();
  });

  test('checkout API failure shows error instead of redirecting to /order/undefined', async ({ page }) => {
    await page.goto('/checkout');

    // Fill form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept checkout API to return response WITHOUT order ID
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          // Intentionally missing orderId
          totals: {
            subtotal: 10.00,
            total: 14.40
          }
        }
      });
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // Wait a moment for the handler to process
    await page.waitForTimeout(1000);

    // CRITICAL: Should NOT redirect to success page
    const url = page.url();
    expect(url).not.toContain('/order/');

    // Should stay on checkout or redirect to error state
    expect(url).toMatch(/checkout/);
  });
});
