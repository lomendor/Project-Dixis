import { test, expect } from '@playwright/test';
import { expectAuthedOrLogin } from './helpers/auth-mode';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the analytics API endpoints with sample data
    await page.route('**/api/v1/admin/analytics/sales**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            period: 'daily',
            data: [
              { date: '2025-09-10', total_sales: 100, order_count: 2, average_order_value: 50 },
              { date: '2025-09-11', total_sales: 150, order_count: 3, average_order_value: 50 },
              { date: '2025-09-12', total_sales: 200, order_count: 4, average_order_value: 50 },
              { date: '2025-09-13', total_sales: 175, order_count: 3, average_order_value: 58.33 },
              { date: '2025-09-14', total_sales: 225, order_count: 4, average_order_value: 56.25 },
              { date: '2025-09-15', total_sales: 300, order_count: 6, average_order_value: 50 },
              { date: '2025-09-16', total_sales: 400, order_count: 8, average_order_value: 50 },
            ],
            summary: {
              total_revenue: 1550,
              total_orders: 30,
              average_order_value: 51.67,
              period_growth: 15.5
            }
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/orders**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            by_status: {
              pending: 15,
              confirmed: 8,
              shipped: 12,
              delivered: 25,
              cancelled: 3
            },
            by_payment_status: {
              pending: 18,
              paid: 42,
              failed: 3
            },
            recent_orders: [
              { id: 1, user_email: 'user1@test.com', total_amount: 50.00, status: 'delivered', payment_status: 'paid', created_at: '2025-09-16T10:00:00Z' },
              { id: 2, user_email: 'user2@test.com', total_amount: 75.00, status: 'shipped', payment_status: 'paid', created_at: '2025-09-16T09:30:00Z' }
            ],
            summary: {
              total_orders: 63,
              pending_orders: 15,
              completed_orders: 25,
              cancelled_orders: 3
            }
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            top_products: [
              { id: 1, name: 'Premium Olive Oil', price: 25.00, total_quantity_sold: 50, total_revenue: 1250, order_count: 20 },
              { id: 2, name: 'Organic Honey', price: 15.00, total_quantity_sold: 30, total_revenue: 450, order_count: 15 },
              { id: 3, name: 'Greek Cheese', price: 12.00, total_quantity_sold: 25, total_revenue: 300, order_count: 12 },
              { id: 4, name: 'Olive Soap', price: 8.00, total_quantity_sold: 20, total_revenue: 160, order_count: 10 },
              { id: 5, name: 'Herbal Tea', price: 10.00, total_quantity_sold: 15, total_revenue: 150, order_count: 8 }
            ],
            summary: {
              total_products: 150,
              active_products: 142,
              out_of_stock: 8,
              best_seller_id: 1,
              best_seller_name: 'Premium Olive Oil'
            }
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/producers**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            active_producers: 25,
            total_producers: 30,
            top_producers: [
              { id: 1, name: 'Olive Grove Co.', location: 'Crete', product_count: 15, total_revenue: 2500, order_count: 45 },
              { id: 2, name: 'Mountain Honey', location: 'Thessaly', product_count: 8, total_revenue: 1800, order_count: 32 },
              { id: 3, name: 'Aegean Dairy', location: 'Lesbos', product_count: 12, total_revenue: 1500, order_count: 28 },
              { id: 4, name: 'Herbs & Spices', location: 'Attica', product_count: 20, total_revenue: 1200, order_count: 24 },
              { id: 5, name: 'Sea Salt Works', location: 'Mani', product_count: 5, total_revenue: 800, order_count: 18 }
            ]
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/dashboard**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          summary: {
            today: {
              sales: 400,
              orders: 8,
              average_order_value: 50
            },
            month: {
              sales: 12500,
              orders: 250,
              average_order_value: 50,
              sales_growth: 18.5,
              orders_growth: 22.3
            },
            totals: {
              users: 1500,
              producers: 30,
              products: 150,
              lifetime_revenue: 75000
            }
          }
        })
      });
    });
  });

  test('admin can view charts with mock data', async ({ page }) => {
    // Navigate to login page and authenticate as admin
    await page.goto('/auth/login');

    // Fill in admin credentials
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();

    // Wait for successful login and redirect
    await expect(page).toHaveURL('/');

    // Navigate to analytics dashboard
    await page.goto('/admin/analytics');

    // Wait for the analytics dashboard to load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Verify KPI cards are displayed
    await expect(page.getByTestId('kpi-today-sales')).toBeVisible();
    await expect(page.getByTestId('kpi-today-orders')).toBeVisible();
    await expect(page.getByTestId('kpi-month-growth')).toBeVisible();
    await expect(page.getByTestId('kpi-avg-order')).toBeVisible();

    // Verify KPI values from mock data
    await expect(page.getByTestId('kpi-today-sales')).toContainText('€400.00');
    await expect(page.getByTestId('kpi-today-orders')).toContainText('8');
    await expect(page.getByTestId('kpi-month-growth')).toContainText('+18.50%');
    await expect(page.getByTestId('kpi-avg-order')).toContainText('€50.00');

    // Verify charts are displayed
    await expect(page.getByTestId('sales-chart')).toBeVisible();
    await expect(page.getByTestId('orders-chart')).toBeVisible();
    await expect(page.getByTestId('products-chart')).toBeVisible();

    // Verify producer performance table
    await expect(page.getByTestId('producers-table')).toBeVisible();
    await expect(page.getByTestId('producer-row-1')).toBeVisible();
    await expect(page.getByTestId('producer-row-1')).toContainText('Olive Grove Co.');
    await expect(page.getByTestId('producer-row-1')).toContainText('Crete');
    await expect(page.getByTestId('producer-row-1')).toContainText('€2,500.00');

    // Verify platform overview stats
    await expect(page.getByTestId('platform-stats')).toBeVisible();
    await expect(page.getByTestId('platform-stats')).toContainText('1,500');  // Total Users
    await expect(page.getByTestId('platform-stats')).toContainText('30');     // Producers
    await expect(page.getByTestId('platform-stats')).toContainText('150');    // Products
    await expect(page.getByTestId('platform-stats')).toContainText('€75,000.00'); // Lifetime Revenue
  });

  test('charts update correctly when API returns new values', async ({ page }) => {
    // Navigate to login page and authenticate as admin
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to analytics dashboard
    await page.goto('/admin/analytics');
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Verify initial daily period is selected
    await expect(page.getByTestId('daily-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('monthly-button')).not.toHaveClass(/bg-green-600/);

    // Mock monthly data response
    await page.route('**/api/v1/admin/analytics/sales**', async route => {
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
                { date: '2025-07', total_sales: 8500, order_count: 170, average_order_value: 50 },
                { date: '2025-08', total_sales: 9200, order_count: 184, average_order_value: 50 },
                { date: '2025-09', total_sales: 10800, order_count: 216, average_order_value: 50 },
              ],
              summary: {
                total_revenue: 28500,
                total_orders: 570,
                average_order_value: 50,
                period_growth: 27.1
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
    await page.waitForTimeout(1000);

    // Verify monthly period is now selected
    await expect(page.getByTestId('monthly-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('daily-button')).not.toHaveClass(/bg-green-600/);

    // Verify charts are still visible (content would be updated but we can't easily test chart.js canvas content)
    await expect(page.getByTestId('sales-chart')).toBeVisible();
    await expect(page.getByTestId('orders-chart')).toBeVisible();
    await expect(page.getByTestId('products-chart')).toBeVisible();

    // Switch back to daily view
    await page.getByTestId('daily-button').click();
    await page.waitForTimeout(1000);

    // Verify daily period is selected again
    await expect(page.getByTestId('daily-button')).toHaveClass(/bg-green-600/);
    await expect(page.getByTestId('monthly-button')).not.toHaveClass(/bg-green-600/);
  });

  test('unauthorized users are redirected', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access analytics dashboard without authentication
    await page.goto('/admin/analytics');

    // Should be redirected to login page
    await expectAuthedOrLogin(page);

    // Verify login form is visible
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('error state displays retry button when API fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/v1/admin/analytics/**', async route => {
      await route.abort('failed');
    });

    // Navigate to login page and authenticate as admin
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to analytics dashboard
    await page.goto('/admin/analytics');

    // Wait for the error state to appear
    await expect(page.getByText('Error Loading Analytics')).toBeVisible();
    await expect(page.getByText('Failed to load analytics data. Please try again.')).toBeVisible();
    await expect(page.getByTestId('retry-button')).toBeVisible();

    // Clear the route mock to allow successful retry
    await page.unroute('**/api/v1/admin/analytics/**');

    // Set up successful mocks again
    await page.route('**/api/v1/admin/analytics/sales**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            period: 'daily',
            data: [{ date: '2025-09-16', total_sales: 100, order_count: 2, average_order_value: 50 }],
            summary: { total_revenue: 100, total_orders: 2, average_order_value: 50, period_growth: 0 }
          }
        })
      });
    });

    // Add other successful route mocks as needed...
    await page.route('**/api/v1/admin/analytics/orders**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            by_status: { pending: 1, delivered: 1 },
            by_payment_status: { paid: 2 },
            recent_orders: [],
            summary: { total_orders: 2, pending_orders: 1, completed_orders: 1, cancelled_orders: 0 }
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            top_products: [{ id: 1, name: 'Test Product', price: 50, total_quantity_sold: 2, total_revenue: 100, order_count: 2 }],
            summary: { total_products: 1, active_products: 1, out_of_stock: 0, best_seller_id: 1 }
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/producers**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analytics: {
            active_producers: 1,
            total_producers: 1,
            top_producers: [{ id: 1, name: 'Test Producer', location: 'Test Location', product_count: 1, total_revenue: 100, order_count: 2 }]
          }
        })
      });
    });

    await page.route('**/api/v1/admin/analytics/dashboard**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          summary: {
            today: { sales: 100, orders: 2, average_order_value: 50 },
            month: { sales: 100, orders: 2, average_order_value: 50, sales_growth: 0, orders_growth: 0 },
            totals: { users: 10, producers: 1, products: 1, lifetime_revenue: 100 }
          }
        })
      });
    });

    // Click retry button
    await page.getByTestId('retry-button').click();

    // Wait for successful load
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
    await expect(page.getByTestId('sales-chart')).toBeVisible();
  });

  test('loading state displays skeleton UI', async ({ page }) => {
    // Delay API responses to test loading state
    await page.route('**/api/v1/admin/analytics/**', async route => {
      await page.waitForTimeout(2000);
      await route.continue();
    });

    // Navigate to login page and authenticate as admin
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to analytics dashboard
    await page.goto('/admin/analytics');

    // Verify loading skeleton is displayed
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
    await expect(page.locator('.animate-pulse')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('.animate-pulse')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sales-chart')).toBeVisible();
  });
});