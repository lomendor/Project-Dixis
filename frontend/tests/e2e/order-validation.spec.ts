import { test, expect } from '@playwright/test';

/**
 * E2E Order Management Tests - Status Transition Validation
 * Verifies that invalid status transitions are properly blocked
 */

test.describe('Order Management - Status Transition Validation', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'admin_mock_token');
      localStorage.setItem('user_role', 'admin');
    });
  });

  test('Invalid status transitions are blocked by validation', async ({ page }) => {
    // Set up mock for invalid transition
    await page.route('**/api/v1/auth/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: 'admin@dixis.local',
        role: 'admin'
      })
    }));

    // Mock order with cancelled status (no valid transitions)
    await page.route('**/api/v1/orders', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [{
          id: 1003,
          user_id: 503,
          status: 'cancelled',
          total_amount: '25.00',
          payment_status: 'failed',
          payment_method: 'credit_card',
          shipping_method: 'HOME',
          created_at: '2025-09-16T09:00:00Z',
          items: [{
            id: 2004,
            product_id: 104,
            quantity: 1,
            price: '25.00',
            product_name: 'Καρύδια Βόλου',
            product_unit: 'κιλό'
          }]
        }]
      })
    }));

    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible({ timeout: 10000 });

    // Verify cancelled order is shown
    await expect(page.getByText('#1003')).toBeVisible();
    await expect(page.getByText('Ακυρώθηκε')).toBeVisible();

    // Verify no status update dropdown is shown for cancelled orders (no valid transitions)
    await expect(page.getByText('Χωρίς ενέργειες')).toBeVisible();

    // Ensure no select dropdown exists for this order
    const noActionsCell = page.getByText('Χωρίς ενέργειες').locator('..');
    await expect(noActionsCell.locator('select')).not.toBeVisible();
  });

  test('Delivered orders have no available transitions', async ({ page }) => {
    await page.route('**/api/v1/auth/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        name: 'Admin User',
        email: 'admin@dixis.local',
        role: 'admin'
      })
    }));

    // Mock order with delivered status (terminal state)
    await page.route('**/api/v1/orders', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [{
          id: 1004,
          user_id: 504,
          status: 'delivered',
          total_amount: '32.50',
          payment_status: 'completed',
          payment_method: 'bank_transfer',
          shipping_method: 'COURIER',
          created_at: '2025-09-14T12:00:00Z',
          items: [{
            id: 2005,
            product_id: 105,
            quantity: 2,
            price: '16.25',
            product_name: 'Τοματάκια Cherry',
            product_unit: 'κιλό'
          }]
        }]
      })
    }));

    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible({ timeout: 10000 });

    // Verify delivered order is shown
    await expect(page.getByText('#1004')).toBeVisible();
    await expect(page.getByText('Παραδόθηκε')).toBeVisible();

    // Verify no actions available for delivered orders
    await expect(page.getByText('Χωρίς ενέργειες')).toBeVisible();
  });
});