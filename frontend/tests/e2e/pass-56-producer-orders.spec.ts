import { test, expect } from '@playwright/test';

/**
 * Pass 56: Producer Orders Split-Brain Fix
 *
 * Tests verify:
 * - Producer orders page loads and shows correct UI elements
 * - API is called (not Prisma)
 * - Status tabs work correctly
 */

test.describe('Pass 56: Producer Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up auth token for producer access
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-producer-token');
      localStorage.setItem('user_role', 'producer');
      localStorage.setItem('user_id', '2');
    });
  });

  test('page loads with status tabs and calls Laravel API', async ({ page }) => {
    // Track API calls
    const apiCalls: string[] = [];

    await page.route('**/api/v1/producer/orders**', async (route) => {
      apiCalls.push(route.request().url());

      // Return mock response
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
              user: {
                id: 5,
                name: 'Test Customer',
                email: 'customer@test.com',
              },
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
          meta: {
            total: 5,
            pending: 2,
            processing: 1,
            shipped: 1,
            delivered: 1,
          },
        }),
      });
    });

    await page.goto('/my/orders');

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /Παραγγελίες/i })).toBeVisible();

    // Verify status tabs are visible
    await expect(page.getByTestId('tab-pending')).toBeVisible();
    await expect(page.getByTestId('tab-processing')).toBeVisible();
    await expect(page.getByTestId('tab-shipped')).toBeVisible();
    await expect(page.getByTestId('tab-delivered')).toBeVisible();

    // Verify API was called (not Prisma)
    expect(apiCalls.length).toBeGreaterThan(0);
    expect(apiCalls[0]).toContain('/api/v1/producer/orders');
  });

  test('displays order data correctly', async ({ page }) => {
    await page.route('**/api/v1/producer/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [
            {
              id: 42,
              user_id: 5,
              status: 'pending',
              payment_status: 'pending',
              payment_method: 'COD',
              subtotal: '100.00',
              shipping_cost: '5.00',
              total: '105.00',
              currency: 'EUR',
              created_at: '2025-12-28T10:00:00Z',
              updated_at: '2025-12-28T10:00:00Z',
              user: {
                id: 5,
                name: 'Maria Papadopoulou',
                email: 'maria@test.com',
              },
              orderItems: [
                {
                  id: 1,
                  product_id: 10,
                  quantity: 5,
                  unit_price: '20.00',
                  total_price: '100.00',
                  product_name: 'Organic Tomatoes',
                  product_unit: 'kg',
                },
              ],
            },
          ],
          meta: {
            total: 1,
            pending: 1,
            processing: 0,
            shipped: 0,
            delivered: 0,
          },
        }),
      });
    });

    await page.goto('/my/orders');

    // Wait for orders list
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Verify order card is visible
    const orderCard = page.getByTestId('order-42');
    await expect(orderCard).toBeVisible();

    // Verify order content
    await expect(orderCard.getByText('Παραγγελία #42')).toBeVisible();
    await expect(orderCard.getByText('Maria Papadopoulou')).toBeVisible();
    await expect(orderCard.getByText('Organic Tomatoes')).toBeVisible();
    await expect(orderCard.getByText('x5')).toBeVisible();
  });

  test('shows empty state when no orders', async ({ page }) => {
    await page.route('**/api/v1/producer/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [],
          meta: {
            total: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
          },
        }),
      });
    });

    await page.goto('/my/orders');

    // Verify empty state is shown
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(
      page.getByText('Δεν υπάρχουν παραγγελίες σε αυτή την κατάσταση')
    ).toBeVisible();
  });

  test('tab navigation changes status filter', async ({ page }) => {
    const statusRequested: string[] = [];

    await page.route('**/api/v1/producer/orders**', async (route) => {
      const url = new URL(route.request().url());
      statusRequested.push(url.searchParams.get('status') || 'none');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: [],
          meta: {
            total: 4,
            pending: 1,
            processing: 1,
            shipped: 1,
            delivered: 1,
          },
        }),
      });
    });

    // Load page (default: pending)
    await page.goto('/my/orders');
    await expect(page.getByTestId('orders-list')).toBeVisible();

    // Click on "shipped" tab
    await page.getByTestId('tab-shipped').click();
    await expect(page).toHaveURL(/tab=shipped/);

    // Verify API calls include status param
    expect(statusRequested).toContain('pending');
    expect(statusRequested).toContain('shipped');
  });
});
