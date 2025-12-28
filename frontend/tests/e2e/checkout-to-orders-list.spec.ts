/**
 * E2E Regression Test: Checkout → Orders List Flow
 *
 * Verifies that orders created via checkout appear in the user's orders list
 * and order details page loads correctly.
 *
 * Root cause fix: Orders list now reads from Laravel API instead of Prisma
 * to match where checkout creates orders.
 *
 * Pass 46: Auth now provided via storageState from globalSetup.
 * Tests use route mocking for deterministic API responses.
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
            title: 'Test Product',
            priceCents: 1000, // €10.00
            qty: 1
          }
        }
      },
      version: 0
    };
    localStorage.setItem('dixis:cart:v1', JSON.stringify(cartState));
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// Helper: Setup mock consumer auth
async function setupConsumerAuth(page: any) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'mock-consumer-token-e2e');
    localStorage.setItem('user_role', 'consumer');
    localStorage.setItem('user_id', '1');
  });
}

test.describe('Checkout → Orders List (Split-Brain Fix)', () => {
  test.skip('order appears in orders list after successful checkout', async ({ page }) => {
    // SETUP: Add item to cart
    await addItemToCart(page);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForSelector('[data-testid="checkout-form"]');

    // Fill checkout form
    await page.locator('[data-testid="checkout-name"]').fill('E2E Test User');
    await page.locator('[data-testid="checkout-phone"]').fill('6912345678');
    await page.locator('[data-testid="checkout-email"]').fill('e2e@test.com');
    await page.locator('[data-testid="checkout-address"]').fill('123 Test Street');
    await page.locator('[data-testid="checkout-city"]').fill('Athens');
    await page.locator('[data-testid="checkout-postal"]').fill('12345');

    // Mock order creation API (Laravel endpoint)
    let createdOrderId: number | null = null;
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'POST') {
        createdOrderId = Math.floor(Math.random() * 10000) + 1000;
        await route.fulfill({
          status: 201,
          json: {
            id: createdOrderId,
            status: 'pending',
            user_id: 1,
            subtotal: '10.00',
            tax_amount: '2.40',
            shipping_amount: '2.00',
            total_amount: '14.40',
            payment_status: 'pending',
            payment_method: 'COD',
            shipping_method: 'HOME',
            created_at: new Date().toISOString(),
            items: [{
              id: 1,
              product_id: 1,
              quantity: 1,
              price: '10.00',
              unit_price: '10.00',
              total_price: '10.00',
              product_name: 'Test Product',
              product_unit: 'kg',
              product: null
            }],
            order_items: []
          }
        });
      } else {
        route.continue();
      }
    });

    // Submit checkout
    await page.locator('[data-testid="checkout-submit"]').click();

    // Wait for redirect (either to /order/{id} or /thank-you)
    await page.waitForURL(/\/(order|thank-you)/, { timeout: 10000 });
    const checkoutResultUrl = page.url();

    // Verify: NOT redirected to error or undefined
    expect(checkoutResultUrl).not.toContain('undefined');
    expect(checkoutResultUrl).not.toContain('err=');

    // SETUP: Login as consumer for orders list access
    await setupConsumerAuth(page);

    // Mock orders list API (Laravel endpoint)
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: {
            data: [{
              id: createdOrderId,
              status: 'pending',
              user_id: 1,
              subtotal: '10.00',
              tax_amount: '2.40',
              shipping_amount: '2.00',
              total_amount: '14.40',
              payment_status: 'pending',
              payment_method: 'COD',
              shipping_method: 'HOME',
              created_at: new Date().toISOString(),
              items: [{
                id: 1,
                product_id: 1,
                quantity: 1,
                price: '10.00',
                unit_price: '10.00',
                total_price: '10.00',
                product_name: 'Test Product',
                product_unit: 'kg',
                product: null
              }],
              order_items: []
            }]
          }
        });
      } else {
        route.continue();
      }
    });

    // Navigate to orders list
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');

    // ASSERT: Orders list NOT empty
    await expect(page.locator('[data-testid="empty-orders-message"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();

    // ASSERT: Order card exists
    const orderCard = page.locator('[data-testid="order-card"]').first();
    await expect(orderCard).toBeVisible();

    // ASSERT: Order ID matches
    const orderIdInCard = await orderCard.getAttribute('data-order-id');
    expect(orderIdInCard).toBe(String(createdOrderId));

    // ASSERT: Order total displays correctly
    await expect(orderCard.locator(':text("€14.40")')).toBeVisible();
  });

  test.skip('order details page loads after checkout', async ({ page }) => {
    const mockOrderId = 12345;

    // SETUP: Consumer auth
    await setupConsumerAuth(page);

    // Mock order details API (Laravel endpoint)
    await page.route(`**/api/v1/public/orders/${mockOrderId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: {
            id: mockOrderId,
            status: 'pending',
            user_id: 1,
            subtotal: '10.00',
            tax_amount: '2.40',
            shipping_amount: '2.00',
            total_amount: '14.40',
            payment_status: 'pending',
            payment_method: 'COD',
            shipping_method: 'HOME',
            shipping_address: '123 Test Street',
            city: 'Athens',
            postal_code: '12345',
            created_at: new Date().toISOString(),
            items: [{
              id: 1,
              product_id: 1,
              quantity: 1,
              price: '10.00',
              unit_price: '10.00',
              total_price: '10.00',
              product_name: 'Test Product',
              product_unit: 'kg',
              product: null
            }],
            order_items: []
          }
        });
      } else {
        route.continue();
      }
    });

    // Navigate to order details
    await page.goto(`/account/orders/${mockOrderId}`);
    await page.waitForLoadState('networkidle');

    // ASSERT: NOT showing error message
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();

    // ASSERT: Order details displayed
    await expect(page.locator(`text=Παραγγελία #${mockOrderId}`)).toBeVisible();
    await expect(page.locator('[data-testid="order-status-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('€14.40');
    await expect(page.locator('[data-testid="order-items-section"]')).toBeVisible();
  });

  test.skip('handles empty orders list gracefully', async ({ page }) => {
    // SETUP: Consumer auth
    await setupConsumerAuth(page);

    // Mock empty orders list
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: { data: [] }
        });
      } else {
        route.continue();
      }
    });

    // Navigate to orders list
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');

    // ASSERT: Empty state displayed
    await expect(page.locator('[data-testid="empty-orders-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-list"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="browse-products-link"]')).toBeVisible();
  });

  test.skip('handles order fetch error gracefully', async ({ page }) => {
    // SETUP: Consumer auth
    await setupConsumerAuth(page);

    // Mock API error
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          json: { error: 'Server error' }
        });
      } else {
        route.continue();
      }
    });

    // Navigate to orders list
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');

    // ASSERT: Empty state shown (error treated as no orders)
    await expect(page.locator('[data-testid="empty-orders-message"]')).toBeVisible();
  });

  // Pass 46: Unskipped - uses storageState auth + API mocking
  test('verifies orders list calls Laravel API endpoint', async ({ page }) => {
    // This test verifies the fix: orders list should call Laravel API, not Prisma /internal/orders
    let calledLaravelApi = false;
    let calledPrismaApi = false;

    // Monitor API calls
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/v1/public/orders') || url.includes('/api/v1/orders')) {
        calledLaravelApi = true;
      }
      if (url.includes('/internal/orders') && !url.includes('/api/')) {
        calledPrismaApi = true;
      }
    });

    // Mock auth/me endpoint for AuthContext
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 1,
          name: 'E2E Consumer',
          email: 'consumer@example.com',
          role: 'consumer',
          profile: { role: 'consumer' }
        }
      });
    });

    // Mock Laravel API response for orders
    await page.route('**/api/v1/public/orders', async (route) => {
      if (route.request().method() === 'GET') {
        calledLaravelApi = true;
        await route.fulfill({
          status: 200,
          json: { data: [] }
        });
      } else {
        route.continue();
      }
    });

    // Also mock /api/v1/orders (alternative endpoint)
    await page.route('**/api/v1/orders', async (route) => {
      if (route.request().method() === 'GET') {
        calledLaravelApi = true;
        await route.fulfill({
          status: 200,
          json: { data: [] }
        });
      } else {
        route.continue();
      }
    });

    // Navigate to orders page - auth provided by storageState
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');

    // ASSERT: Should call Laravel API
    expect(calledLaravelApi).toBe(true);
    // ASSERT: Should NOT call Prisma /internal/orders
    expect(calledPrismaApi).toBe(false);
  });
});
