import { test, expect } from '@playwright/test';

test.describe('Producer Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the producer analytics API endpoints with sample data
    await page.route('**/api/v1/producer/analytics/sales**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            period: 'daily',
            data: [
              { date: '2025-09-10', total_sales: 60, order_count: 1, average_order_value: 60 },
              { date: '2025-09-11', total_sales: 85, order_count: 2, average_order_value: 42.5 },
              { date: '2025-09-12', total_sales: 120, order_count: 2, average_order_value: 60 },
              { date: '2025-09-13', total_sales: 95, order_count: 1, average_order_value: 95 },
              { date: '2025-09-14', total_sales: 140, order_count: 3, average_order_value: 46.67 },
              { date: '2025-09-15', total_sales: 180, order_count: 3, average_order_value: 60 },
              { date: '2025-09-16', total_sales: 220, order_count: 4, average_order_value: 55 },
            ],
            summary: {
              total_revenue: 900,
              total_orders: 16,
              average_order_value: 56.25,
              period_growth: 12.5
            }
          }
        })
      });
    });

    await page.route('**/api/v1/producer/analytics/orders**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            by_status: {
              pending: 3,
              confirmed: 2,
              shipped: 4,
              delivered: 7,
              cancelled: 0
            },
            by_payment_status: {
              pending: 3,
              paid: 13,
              failed: 0
            },
            recent_orders: [
              { id: 51, user_email: 'customer1@test.com', total_amount: 75.00, status: 'delivered', payment_status: 'paid', created_at: '2025-09-16T14:30:00Z' },
              { id: 52, user_email: 'customer2@test.com', total_amount: 45.00, status: 'shipped', payment_status: 'paid', created_at: '2025-09-16T13:15:00Z' }
            ],
            summary: {
              total_orders: 16,
              pending_orders: 3,
              completed_orders: 7,
              cancelled_orders: 0
            }
          }
        })
      });
    });

    await page.route('**/api/v1/producer/analytics/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            top_products: [
              { id: 101, name: 'My Premium Olive Oil', price: 35.00, total_quantity_sold: 15, total_revenue: 525, order_count: 8 },
              { id: 102, name: 'My Organic Honey', price: 18.00, total_quantity_sold: 12, total_revenue: 216, order_count: 6 },
              { id: 103, name: 'My Goat Cheese', price: 22.00, total_quantity_sold: 8, total_revenue: 176, order_count: 4 },
              { id: 104, name: 'My Herbal Soap', price: 12.00, total_quantity_sold: 6, total_revenue: 72, order_count: 3 },
              { id: 105, name: 'My Mountain Tea', price: 15.00, total_quantity_sold: 4, total_revenue: 60, order_count: 2 }
            ],
            summary: {
              total_products: 8,
              active_products: 7,
              out_of_stock: 1,
              best_seller_id: 101,
              best_seller_name: 'My Premium Olive Oil'
            }
          }
        })
      });
    });

    // Mock producer user authentication
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 100,
          name: 'Producer User',
          email: 'producer@test.com',
          role: 'producer',
          producer_id: 1
        })
      });
    });
  });

  test('producer sees only their own product data in dashboard', async ({ page }) => {
    // Navigate to login page and authenticate as producer
    await page.goto('/auth/login');

    // Fill in producer credentials
    await page.getByTestId('email-input').fill('producer@test.com');
    await page.getByTestId('password-input').fill('producer123');
    await page.getByTestId('login-button').click();

    // Wait for successful login and redirect
    await expect(page).toHaveURL('/');

    // Navigate to producer analytics dashboard
    await page.goto('/producer/analytics');

    // Wait for the producer analytics dashboard to load
    await expect(page.getByTestId('producer-analytics-dashboard')).toBeVisible();

    // Verify producer-specific KPI cards are displayed
    await expect(page.getByTestId('kpi-total-revenue')).toBeVisible();
    await expect(page.getByTestId('kpi-total-orders')).toBeVisible();
    await expect(page.getByTestId('kpi-growth')).toBeVisible();

    // Verify KPI values from producer-scoped mock data
    await expect(page.getByTestId('kpi-total-revenue')).toContainText('€900.00');
    await expect(page.getByTestId('kpi-total-orders')).toContainText('16');
    await expect(page.getByTestId('kpi-growth')).toContainText('+12.50%');

    // Verify producer-scoped charts are displayed
    await expect(page.getByTestId('producer-sales-chart')).toBeVisible();
    await expect(page.getByTestId('producer-orders-chart')).toBeVisible();
    await expect(page.getByTestId('producer-products-chart')).toBeVisible();

    // Verify producer products table shows only own products
    await expect(page.getByTestId('producer-products-table')).toBeVisible();
    await expect(page.getByTestId('producer-product-row-101')).toBeVisible();
    await expect(page.getByTestId('producer-product-row-101')).toContainText('My Premium Olive Oil');
    await expect(page.getByTestId('producer-product-row-101')).toContainText('€35.00');
    await expect(page.getByTestId('producer-product-row-101')).toContainText('€525.00');

    // Verify second product in table
    await expect(page.getByTestId('producer-product-row-102')).toBeVisible();
    await expect(page.getByTestId('producer-product-row-102')).toContainText('My Organic Honey');
    await expect(page.getByTestId('producer-product-row-102')).toContainText('€18.00');

    // Verify producer portfolio overview stats
    await expect(page.getByTestId('producer-product-stats')).toBeVisible();
    await expect(page.getByTestId('producer-product-stats')).toContainText('8');      // Total Products
    await expect(page.getByTestId('producer-product-stats')).toContainText('7');      // Active Products
    await expect(page.getByTestId('producer-product-stats')).toContainText('1');      // Out of Stock
    await expect(page.getByTestId('producer-product-stats')).toContainText('My Premium Olive Oil'); // Best Seller

    // Verify producer-specific information section
    await expect(page.getByTestId('producer-analytics-info')).toBeVisible();
    await expect(page.getByTestId('producer-analytics-info')).toContainText('This dashboard displays analytics data specific to your products');
    await expect(page.getByTestId('producer-analytics-info')).toContainText('Data shows only orders containing your products');
  });

  test('unauthorized user without producer association is blocked', async ({ page }) => {
    // Mock regular user without producer_id
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 200,
          name: 'Regular User',
          email: 'user@test.com',
          role: 'consumer',
          producer_id: null
        })
      });
    });

    // Mock 403 error for producer analytics endpoints
    await page.route('**/api/v1/producer/analytics/**', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'User is not associated with a producer'
        })
      });
    });

    // Navigate to login page and authenticate as regular user
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('user@test.com');
    await page.getByTestId('password-input').fill('user123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Try to access producer analytics dashboard
    await page.goto('/producer/analytics');

    // Wait for the dashboard to load and show error
    await expect(page.getByTestId('producer-analytics-dashboard')).toBeVisible();

    // Verify error state is displayed
    await expect(page.getByText('Error Loading Analytics')).toBeVisible();
    await expect(page.getByText('You need to be associated with a producer')).toBeVisible();
    await expect(page.getByTestId('retry-button')).toBeVisible();

    // Verify charts are not displayed in error state
    await expect(page.getByTestId('producer-sales-chart')).not.toBeVisible();
    await expect(page.getByTestId('producer-orders-chart')).not.toBeVisible();
    await expect(page.getByTestId('producer-products-chart')).not.toBeVisible();
  });

  test('charts render with correct mock values and period toggle works', async ({ page }) => {
    // Navigate to login page and authenticate as producer
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('producer@test.com');
    await page.getByTestId('password-input').fill('producer123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to producer analytics dashboard
    await page.goto('/producer/analytics');
    await expect(page.getByTestId('producer-analytics-dashboard')).toBeVisible();

    // Verify initial daily period is selected
    await expect(page.getByTestId('daily-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('monthly-button')).not.toHaveClass(/bg-green-600/);

    // Verify all charts are rendered
    await expect(page.getByTestId('producer-sales-chart')).toBeVisible();
    await expect(page.getByTestId('producer-orders-chart')).toBeVisible();
    await expect(page.getByTestId('producer-products-chart')).toBeVisible();

    // Mock monthly data response for period toggle test
    await page.route('**/api/v1/producer/analytics/sales**', async route => {
      const url = new URL(route.request().url());
      const period = url.searchParams.get('period');

      if (period === 'monthly') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            analytics: {
              period: 'monthly',
              data: [
                { date: '2025-07', total_sales: 2400, order_count: 42, average_order_value: 57.14 },
                { date: '2025-08', total_sales: 2700, order_count: 48, average_order_value: 56.25 },
                { date: '2025-09', total_sales: 3100, order_count: 54, average_order_value: 57.41 },
              ],
              summary: {
                total_revenue: 8200,
                total_orders: 144,
                average_order_value: 56.94,
                period_growth: 29.2
              }
            }
          })
        });
      } else {
        // Return original daily data
        await route.continue();
      }
    });

    // Switch to monthly view
    await page.getByTestId('monthly-button').click();

    // Wait for the chart to update
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");

    // Verify monthly period is now selected
    await expect(page.getByTestId('monthly-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('daily-button')).not.toHaveClass(/bg-green-600/);

    // Verify charts are still visible (content updated but canvas not easily testable)
    await expect(page.getByTestId('producer-sales-chart')).toBeVisible();
    await expect(page.getByTestId('producer-orders-chart')).toBeVisible();
    await expect(page.getByTestId('producer-products-chart')).toBeVisible();

    // Switch back to daily view
    await page.getByTestId('daily-button').click();
    // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");

    // Verify daily period is selected again
    await expect(page.getByTestId('daily-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('monthly-button')).not.toHaveClass(/bg-green-600/);

    // Verify error handling with retry functionality
    await page.route('**/api/v1/producer/analytics/**', async route => {
      await route.abort('failed');
    });

    // Force a reload to trigger error state
    await page.reload();
    await expect(page.getByText('Error Loading Analytics')).toBeVisible();
    await expect(page.getByTestId('retry-button')).toBeVisible();

    // Clear the route mock and set up successful response
    await page.unroute('**/api/v1/producer/analytics/**');

    // Re-setup successful mocks
    await page.route('**/api/v1/producer/analytics/sales**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            period: 'daily',
            data: [{ date: '2025-09-16', total_sales: 150, order_count: 3, average_order_value: 50 }],
            summary: { total_revenue: 150, total_orders: 3, average_order_value: 50, period_growth: 5.0 }
          }
        })
      });
    });

    await page.route('**/api/v1/producer/analytics/orders**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            by_status: { pending: 1, delivered: 2 },
            by_payment_status: { paid: 3 },
            recent_orders: [],
            summary: { total_orders: 3, pending_orders: 1, completed_orders: 2, cancelled_orders: 0 }
          }
        })
      });
    });

    await page.route('**/api/v1/producer/analytics/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            top_products: [{ id: 101, name: 'Test Product', price: 50, total_quantity_sold: 3, total_revenue: 150, order_count: 3 }],
            summary: { total_products: 1, active_products: 1, out_of_stock: 0, best_seller_name: 'Test Product' }
          }
        })
      });
    });

    // Click retry button
    await page.getByTestId('retry-button').click();

    // Wait for successful load
    await expect(page.getByTestId('producer-analytics-dashboard')).toBeVisible();
    await expect(page.getByTestId('producer-sales-chart')).toBeVisible();
  });

  test('loading state displays skeleton UI', async ({ page }) => {
    // Delay API responses to test loading state
    await page.route('**/api/v1/producer/analytics/**', async route => {
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");
      await route.continue();
    });

    // Navigate to login page and authenticate as producer
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('producer@test.com');
    await page.getByTestId('password-input').fill('producer123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to producer analytics dashboard
    await page.goto('/producer/analytics');

    // Verify loading skeleton is displayed
    await expect(page.getByTestId('producer-analytics-dashboard')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('.animate-pulse')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('producer-sales-chart')).toBeVisible();
  });
});