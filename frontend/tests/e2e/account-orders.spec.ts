import { test, expect } from '@playwright/test';
import { loginAsConsumer, loginAsProducer } from './helpers/test-auth';

test.describe('Customer Orders', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('buyer completes checkout and order appears in history', async ({ page }) => {
    // Setup consumer authentication
    await setupMockAuthForConsumer(page);

    // Navigate to products page
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');

    // Add product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('[data-testid="add-to-cart-btn"]').click();

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForSelector('[data-testid="cart-item"]');

    // Proceed to checkout
    await page.locator('[data-testid="proceed-to-checkout-btn"]').click();

    // Fill checkout form
    await page.waitForSelector('[data-testid="checkout-form"]');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Test Street');
    await page.locator('[data-testid="city-input"]').fill('Athens');
    await page.locator('[data-testid="postal-code-input"]').fill('12345');
    await page.locator('[data-testid="payment-method-select"]').selectOption('credit_card');
    await page.locator('[data-testid="shipping-method-select"]').selectOption('HOME');

    // Submit order
    await page.locator('[data-testid="submit-order-btn"]').click();

    // Wait for success and navigation to order confirmation
    await page.waitForSelector('[data-testid="order-confirmation"]', { timeout: 10000 });

    // Navigate to order history
    await page.goto('/account/orders');

    // Verify order appears in list
    await page.waitForSelector('[data-testid="orders-list"]');
    const orderCard = page.locator('[data-testid="order-card"]').first();
    await expect(orderCard).toBeVisible();

    // Verify order status is visible
    await expect(orderCard.locator('[data-testid="order-status"]')).toBeVisible();

    // Verify view details link is present
    await expect(orderCard.locator('[data-testid="view-order-details-link"]')).toBeVisible();
  });

  test('order details page shows correct items and totals', async ({ page }) => {
    // Setup consumer authentication
    await setupMockAuthForConsumer(page);

    // Mock an existing order
    await page.route('**/api/v1/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: {
            orders: [
              {
                id: 123,
                status: 'paid',
                total_amount: '45.50',
                created_at: '2025-01-15T10:00:00Z',
                payment_method: 'credit_card',
                shipping_method: 'HOME',
                subtotal: '40.00',
                tax_amount: '3.50',
                shipping_amount: '2.00',
                items: [
                  {
                    id: 1,
                    product_id: 10,
                    product_name: 'Greek Olive Oil',
                    quantity: 2,
                    unit_price: '15.00',
                    total_price: '30.00',
                    product_unit: 'bottle'
                  },
                  {
                    id: 2,
                    product_id: 20,
                    product_name: 'Feta Cheese',
                    quantity: 1,
                    unit_price: '10.00',
                    total_price: '10.00',
                    product_unit: 'kg'
                  }
                ]
              }
            ]
          }
        });
      } else {
        await route.continue();
      }
    });

    // Mock order details endpoint
    await page.route('**/api/v1/orders/123', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 123,
          status: 'paid',
          total_amount: '45.50',
          created_at: '2025-01-15T10:00:00Z',
          payment_method: 'credit_card',
          shipping_method: 'HOME',
          shipping_address: '123 Test Street',
          city: 'Athens',
          postal_code: '12345',
          subtotal: '40.00',
          tax_amount: '3.50',
          shipping_amount: '2.00',
          notes: 'Please deliver in the morning',
          items: [
            {
              id: 1,
              product_id: 10,
              product_name: 'Greek Olive Oil',
              quantity: 2,
              unit_price: '15.00',
              total_price: '30.00',
              product_unit: 'bottle'
            },
            {
              id: 2,
              product_id: 20,
              product_name: 'Feta Cheese',
              quantity: 1,
              unit_price: '10.00',
              total_price: '10.00',
              product_unit: 'kg'
            }
          ]
        }
      });
    });

    // Navigate directly to order details page
    await page.goto('/account/orders/123');

    // Wait for order details to load
    await page.waitForSelector('[data-testid="order-items-section"]');

    // Verify order status badge
    await expect(page.locator('[data-testid="order-status-badge"]')).toContainText('Paid');

    // Verify items are displayed
    const orderItems = page.locator('[data-testid="order-item"]');
    await expect(orderItems).toHaveCount(2);

    // Verify first item details
    const firstItem = orderItems.first();
    await expect(firstItem.locator('[data-testid="product-name"]')).toContainText('Greek Olive Oil');
    await expect(firstItem.locator('[data-testid="item-quantity"]')).toContainText('2');
    await expect(firstItem.locator('[data-testid="unit-price"]')).toContainText('€15.00');
    await expect(firstItem.locator('[data-testid="item-total"]')).toContainText('€30.00');

    // Verify payment summary
    await expect(page.locator('[data-testid="subtotal-amount"]')).toContainText('€40.00');
    await expect(page.locator('[data-testid="tax-amount"]')).toContainText('€3.50');
    await expect(page.locator('[data-testid="shipping-amount"]')).toContainText('€2.00');
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('€45.50');

    // Verify shipping info
    await expect(page.locator('[data-testid="payment-method"]')).toContainText('credit_card');
    await expect(page.locator('[data-testid="shipping-method"]')).toContainText('HOME');
    await expect(page.locator('[data-testid="shipping-address"]')).toContainText('123 Test Street');
    await expect(page.locator('[data-testid="order-notes"]')).toContainText('Please deliver in the morning');

    // Verify timeline section exists
    await expect(page.locator('[data-testid="order-timeline-section"]')).toBeVisible();
  });

  test('access to another users order is blocked', async ({ page }) => {
    // Setup consumer authentication
    await setupMockAuthForConsumer(page);

    // Mock 403 response for unauthorized order
    await page.route('**/api/v1/orders/999', async (route) => {
      await route.fulfill({
        status: 403,
        json: {
          message: 'You are not authorized to view this order'
        }
      });
    });

    // Try to access another user's order
    await page.goto('/account/orders/999');

    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Should have back button and view all orders link
    await expect(page.locator('[data-testid="back-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-all-orders-link"]')).toBeVisible();

    // Click view all orders should navigate to order history
    await page.locator('[data-testid="view-all-orders-link"]').click();
    await page.waitForURL('**/account/orders');
    await expect(page.url()).toContain('/account/orders');
  });

  test('empty order history shows correct message', async ({ page }) => {
    // Setup consumer authentication
    await setupMockAuthForConsumer(page);

    // Mock empty orders response
    await page.route('**/api/v1/orders', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          orders: []
        }
      });
    });

    // Navigate to order history
    await page.goto('/account/orders');

    // Should show empty state
    await page.waitForSelector('[data-testid="empty-orders-message"]');
    await expect(page.locator('[data-testid="empty-orders-message"]')).toBeVisible();

    // Should have browse products link
    await expect(page.locator('[data-testid="browse-products-link"]')).toBeVisible();

    // Click browse products should navigate to products page
    await page.locator('[data-testid="browse-products-link"]').click();
    await page.waitForURL('**/products');
    await expect(page.url()).toContain('/products');
  });

  test('producer role is redirected from consumer orders', async ({ page }) => {
    // Setup producer authentication
    await setupMockAuthForProducer(page);

    // Try to access consumer orders page
    await page.goto('/account/orders');

    // Should redirect to producer dashboard
    await page.waitForURL('**/producer/dashboard');
    await expect(page.url()).toContain('/producer/dashboard');
  });
});