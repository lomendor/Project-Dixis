/**
 * Regression tests for orders navigation and checkout order ID
 *
 * A) Header "Οι Παραγγελίες Μου" link must go to /account/orders (not home)
 * B) Checkout must not show "order: undefined" - requires valid order ID before redirect
 */
import { test, expect } from '@playwright/test';

test.describe('Orders Nav + Checkout ID Regressions', () => {
  test('A) Header "Οι Παραγγελίες Μου" link goes to /account/orders', async ({ page }) => {
    // Setup: Mock login as consumer
    await page.goto('/');

    // Mock localStorage auth state (consumer user)
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-consumer-token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_id', '1');
    });

    // Reload to apply auth state
    await page.reload();

    // Wait for header to render with auth state
    await page.waitForLoadState('networkidle');

    // Find and click desktop nav link
    const desktopNavLink = page.locator('[data-testid="nav-my-orders"]');

    // Verify link exists and is visible (consumer-only)
    await expect(desktopNavLink).toBeVisible();

    // Click the link
    await desktopNavLink.click();

    // CRITICAL: Verify URL is /account/orders (NOT / or any other route)
    await page.waitForURL('**/account/orders');
    expect(page.url()).toContain('/account/orders');
    expect(page.url()).not.toContain('undefined');

    // Verify we're on the correct page (not redirected to home)
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Ιστορικό Παραγγελιών');
  });

  test('B) Checkout prevents /order/undefined when API response missing ID', async ({ page }) => {
    await page.goto('/checkout');

    // Fill checkout form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-email"]').fill('test@example.com');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept checkout API to return response WITHOUT order ID
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          // Intentionally NO orderId field
          totals: {
            subtotal: 10.00,
            total: 14.40
          }
        }
      });
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // Wait for handler to process
    await page.waitForTimeout(1000);

    // CRITICAL: Should NOT redirect to /order/undefined
    const url = page.url();
    expect(url).not.toContain('/order/undefined');
    expect(url).not.toContain('/order/');

    // Should stay on checkout or show error
    expect(url).toContain('checkout');

    // Verify error query param (checkout contract requires id)
    expect(url).toContain('err=no-order-id');
  });

  test('C) Checkout WITH valid order ID redirects correctly', async ({ page }) => {
    await page.goto('/checkout');

    // Fill checkout form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="checkout-name"]').fill('Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-email"]').fill('test@example.com');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Intercept checkout API with VALID order ID
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          orderId: 'ORD-2025-001',
          totals: {
            subtotal: 10.00,
            shipping: 2.00,
            vat: 2.40,
            total: 14.40
          }
        }
      });
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // Wait for redirect
    await page.waitForURL('**/order/**', { timeout: 10000 });
    const successUrl = page.url();

    // CRITICAL: URL must contain actual order ID (not "undefined")
    expect(successUrl).toContain('/order/');
    expect(successUrl).toContain('ORD-2025-001');
    expect(successUrl).not.toContain('undefined');

    // Verify order ID is displayed on success page
    const orderIdElement = page.locator('[data-testid="order-id"]');
    await expect(orderIdElement).toBeVisible();

    const orderIdText = await orderIdElement.textContent();
    expect(orderIdText).toContain('ORD-2025-001');
    expect(orderIdText).not.toContain('undefined');
  });
});
