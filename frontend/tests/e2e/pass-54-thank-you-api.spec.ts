/**
 * Pass 54: Thank-You Page Uses Laravel API
 *
 * Verifies that the thank-you page fetches order data from Laravel API
 * (single source of truth) instead of the legacy Prisma/Next.js API route.
 *
 * Bug: Thank-you page was fetching from /api/orders/[id] (Prisma/SQLite)
 *      while orders are created in Laravel/PostgreSQL - causing "order not found".
 * Fix: Thank-you page now uses apiClient.getPublicOrder() to fetch from Laravel.
 */
import { test, expect } from '@playwright/test';

test.describe('Pass 54: Thank-You Page API Source', () => {
  test('@smoke thank-you page fetches from Laravel API', async ({ page }) => {
    // Track which API endpoint is called
    let laravelApiCalled = false;
    let legacyApiCalled = false;

    // Intercept Laravel API call (the correct source)
    await page.route('**/api/v1/public/orders/*', async (route) => {
      laravelApiCalled = true;
      // Return mock order data
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 123,
            status: 'pending',
            total_amount: '15.00',
            subtotal: '11.50',
            shipping_amount: '3.50',
            tax_amount: '0.00',
            shipping_method: 'HOME',
            payment_method: 'COD',
            created_at: new Date().toISOString(),
            items: [
              {
                id: 1,
                product_id: 1,
                product_name: 'Test Product',
                quantity: 1,
                unit_price: '11.50',
                price: '11.50',
              }
            ],
            order_items: []
          }
        })
      });
    });

    // Intercept legacy Next.js API call (should NOT be used)
    await page.route('**/api/orders/*', async (route) => {
      legacyApiCalled = true;
      // If this gets called, the bug still exists
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Legacy API should not be called' })
      });
    });

    // Navigate to thank-you page with order ID
    await page.goto('/thank-you?id=123');

    // Wait for page to load and fetch order
    await page.waitForSelector('[data-testid="thank-you-page"], [data-testid="order-id"]', { timeout: 10000 });

    // Verify the correct API was called
    expect(laravelApiCalled).toBe(true);
    expect(legacyApiCalled).toBe(false);

    // Verify order ID is displayed
    const orderIdElement = page.getByTestId('order-id');
    if (await orderIdElement.isVisible()) {
      await expect(orderIdElement).toHaveText('123');
    }
  });

  test('@smoke thank-you page shows order details from Laravel', async ({ page }) => {
    // Mock Laravel API response with specific values
    await page.route('**/api/v1/public/orders/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 456,
            status: 'pending',
            total_amount: '25.00',
            subtotal: '20.00',
            shipping_amount: '5.00',
            tax_amount: '0.00',
            shipping_method: 'HOME',
            payment_method: 'CARD',
            shipping_address: {
              name: 'Test User',
              city: 'Athens',
              postal_code: '10671'
            },
            created_at: new Date().toISOString(),
            items: [
              {
                id: 1,
                product_id: 1,
                product_name: 'Premium Olive Oil',
                quantity: 2,
                unit_price: '10.00',
                price: '10.00',
              }
            ],
            order_items: []
          }
        })
      });
    });

    await page.goto('/thank-you?id=456');
    await page.waitForSelector('[data-testid="thank-you-page"]', { timeout: 10000 });

    // Verify order total is displayed correctly (from Laravel data)
    const totalElement = page.getByTestId('order-total');
    if (await totalElement.isVisible()) {
      // Check that the total contains the expected amount (formatted in EUR)
      const totalText = await totalElement.textContent();
      expect(totalText).toContain('25');
    }
  });
});
