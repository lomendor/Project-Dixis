import { test, expect } from '@playwright/test';

/**
 * Pass 58: Producer Order Status Updates
 *
 * Tests verify:
 * - Status update button is visible on orders with valid transitions
 * - Clicking button calls API and updates UI
 * - Button is disabled during update
 * - Delivered orders have no update button (terminal state)
 */

test.describe('Pass 58: Producer Order Status Updates', () => {
  test.beforeEach(async ({ page }) => {
    // Set up auth token for producer access
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-producer-token');
      localStorage.setItem('user_role', 'producer');
      localStorage.setItem('user_id', '2');
    });
  });

  test('status update button visible on pending order', async ({ page }) => {
    // Mock orders list API
    await page.route('**/api/v1/producer/orders**', async (route) => {
      if (route.request().url().includes('/export')) return;
      if (route.request().method() === 'PATCH') return;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 1,
              user_id: 5,
              status: 'pending',
              payment_status: 'pending',
              payment_method: 'COD',
              subtotal: '50.00',
              shipping_cost: '5.00',
              total: '55.00',
              currency: 'EUR',
              created_at: '2025-12-28T10:00:00Z',
              updated_at: '2025-12-28T10:00:00Z',
              user: { id: 5, name: 'Test Customer', email: 'customer@test.com' },
              orderItems: [
                {
                  id: 1,
                  product_id: 10,
                  quantity: 2,
                  unit_price: '25.00',
                  total_price: '50.00',
                  product_name: 'Test Product',
                  product_unit: 'kg',
                },
              ],
            },
          ],
          meta: { total: 1, pending: 1, processing: 0, shipped: 0, delivered: 0 },
        }),
      });
    });

    await page.goto('/my/orders');

    // Wait for orders list
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Verify status update button is visible with correct label
    const updateButton = page.getByTestId('status-update-1');
    await expect(updateButton).toBeVisible();
    await expect(updateButton).toContainText('Αλλαγή σε: Σε Επεξεργασία');
  });

  test('clicking status update button calls API and updates UI', async ({ page }) => {
    let updateCalled = false;
    let requestBody: { status?: string } = {};

    // Mock orders list API
    await page.route('**/api/v1/producer/orders**', async (route) => {
      if (route.request().url().includes('/export')) return;

      // Handle PATCH request for status update
      if (route.request().method() === 'PATCH') {
        updateCalled = true;
        requestBody = JSON.parse(route.request().postData() || '{}');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Order status updated',
            order: {
              id: 1,
              status: 'processing',
              user: { id: 5, name: 'Test Customer', email: 'customer@test.com' },
              orderItems: [],
            },
          }),
        });
        return;
      }

      // Handle GET request for orders list
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 1,
              user_id: 5,
              status: 'pending',
              payment_status: 'pending',
              payment_method: 'COD',
              subtotal: '50.00',
              shipping_cost: '5.00',
              total: '55.00',
              currency: 'EUR',
              created_at: '2025-12-28T10:00:00Z',
              updated_at: '2025-12-28T10:00:00Z',
              user: { id: 5, name: 'Test Customer', email: 'customer@test.com' },
              orderItems: [
                {
                  id: 1,
                  product_id: 10,
                  quantity: 2,
                  unit_price: '25.00',
                  total_price: '50.00',
                  product_name: 'Test Product',
                  product_unit: 'kg',
                },
              ],
            },
          ],
          meta: { total: 1, pending: 1, processing: 0, shipped: 0, delivered: 0 },
        }),
      });
    });

    await page.goto('/my/orders');

    // Wait for orders list
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Click status update button
    const updateButton = page.getByTestId('status-update-1');
    await updateButton.click();

    // Wait for API call
    await page.waitForTimeout(500);

    // Verify API was called with correct payload
    expect(updateCalled).toBe(true);
    expect(requestBody.status).toBe('processing');

    // Verify UI updated (button now shows next transition)
    await expect(updateButton).toContainText('Αλλαγή σε: Απεστάλη');
  });

  test('delivered orders have no update button', async ({ page }) => {
    // Mock orders list API with delivered order
    await page.route('**/api/v1/producer/orders**', async (route) => {
      if (route.request().url().includes('/export')) return;
      if (route.request().method() === 'PATCH') return;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 1,
              user_id: 5,
              status: 'delivered',
              payment_status: 'paid',
              payment_method: 'COD',
              subtotal: '50.00',
              shipping_cost: '5.00',
              total: '55.00',
              currency: 'EUR',
              created_at: '2025-12-28T10:00:00Z',
              updated_at: '2025-12-28T10:00:00Z',
              user: { id: 5, name: 'Test Customer', email: 'customer@test.com' },
              orderItems: [
                {
                  id: 1,
                  product_id: 10,
                  quantity: 2,
                  unit_price: '25.00',
                  total_price: '50.00',
                  product_name: 'Test Product',
                  product_unit: 'kg',
                },
              ],
            },
          ],
          meta: { total: 1, pending: 0, processing: 0, shipped: 0, delivered: 1 },
        }),
      });
    });

    await page.goto('/my/orders?tab=delivered');

    // Wait for orders list
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Verify order card is visible
    await expect(page.getByTestId('order-1')).toBeVisible();

    // Verify no update button for delivered order
    await expect(page.getByTestId('status-update-1')).not.toBeVisible();
  });

  test('button shows loading state during update', async ({ page }) => {
    // Mock orders list API with slow status update
    await page.route('**/api/v1/producer/orders**', async (route) => {
      if (route.request().url().includes('/export')) return;

      // Handle PATCH request with delay
      if (route.request().method() === 'PATCH') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Order status updated',
            order: { id: 1, status: 'processing', orderItems: [] },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 1,
              status: 'pending',
              user: { id: 5, name: 'Test Customer', email: 'customer@test.com' },
              orderItems: [{ id: 1, product_name: 'Test', quantity: 1, total_price: '10.00' }],
              created_at: '2025-12-28T10:00:00Z',
            },
          ],
          meta: { total: 1, pending: 1, processing: 0, shipped: 0, delivered: 0 },
        }),
      });
    });

    await page.goto('/my/orders');

    // Wait for orders list
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Click status update button
    const updateButton = page.getByTestId('status-update-1');
    await updateButton.click();

    // Verify loading state
    await expect(updateButton).toContainText('Ενημέρωση...');
    await expect(updateButton).toBeDisabled();
  });
});
