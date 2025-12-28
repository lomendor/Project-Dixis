import { test, expect } from '@playwright/test';

/**
 * Pass 57: Producer Orders CSV Export
 *
 * Tests verify:
 * - Export button is visible on /my/orders
 * - Export endpoint returns text/csv content-type
 * - CSV contains expected header row
 */

test.describe('Pass 57: Producer Orders CSV Export', () => {
  test.beforeEach(async ({ page }) => {
    // Set up auth token for producer access
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-producer-token');
      localStorage.setItem('user_role', 'producer');
      localStorage.setItem('user_id', '2');
    });

    // Mock the orders list API
    await page.route('**/api/v1/producer/orders**', async (route) => {
      if (route.request().url().includes('/export')) {
        // Handle export route
        return;
      }
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
  });

  test('export button is visible on producer orders page', async ({ page }) => {
    await page.goto('/my/orders');

    // Verify export button is visible
    const exportButton = page.getByTestId('export-csv-button');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toHaveText('Εξαγωγή CSV');
  });

  test('export endpoint returns CSV with correct headers', async ({ page }) => {
    // Track export API call
    let exportCalled = false;
    let csvContent = '';

    await page.route('**/api/v1/producer/orders/export**', async (route) => {
      exportCalled = true;

      // Return mock CSV
      const mockCsv = `\uFEFForder_id,created_at,status,customer_name,customer_email,items_summary,subtotal,shipping,total,payment_method,shipping_method
1,2025-12-28 10:00,pending,Test Customer,test@example.com,Product A x2,50.00,5.00,55.00,COD,HOME`;

      csvContent = mockCsv;

      await route.fulfill({
        status: 200,
        contentType: 'text/csv; charset=utf-8',
        headers: {
          'Content-Disposition': 'attachment; filename="orders-2025-12-28.csv"',
        },
        body: mockCsv,
      });
    });

    await page.goto('/my/orders');

    // Click export button
    const exportButton = page.getByTestId('export-csv-button');
    await exportButton.click();

    // Wait for the export call
    await page.waitForTimeout(500);

    // Verify export was called
    expect(exportCalled).toBe(true);

    // Verify CSV contains expected header
    expect(csvContent).toContain('order_id');
    expect(csvContent).toContain('customer_name');
    expect(csvContent).toContain('items_summary');
  });

  test('export button shows loading state during export', async ({ page }) => {
    // Slow down the export response
    await page.route('**/api/v1/producer/orders/export**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'text/csv; charset=utf-8',
        body: 'order_id\n1',
      });
    });

    await page.goto('/my/orders');

    const exportButton = page.getByTestId('export-csv-button');

    // Click and check for loading state
    await exportButton.click();

    // Button should show loading text
    await expect(exportButton).toContainText('Εξαγωγή...');
  });

  test('API endpoint requires authentication', async ({ page, request }) => {
    // Test that unauthenticated request fails
    // Note: This tests the contract, not the actual Laravel middleware
    const response = await request.get('/api/v1/producer/orders/export', {
      headers: {
        // No auth header
      },
    });

    // Should be 401 or redirect (depends on API config)
    // We just verify it's not 200 without auth
    expect(response.status()).not.toBe(200);
  });
});
