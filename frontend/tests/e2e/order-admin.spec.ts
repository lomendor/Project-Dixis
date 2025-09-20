import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Order Management Tests - Admin Workflow
 * Verifies order status update functionality for administrators
 */

const mockOrders = [
  {
    id: 1001,
    user_id: 501,
    status: 'paid',
    total_amount: '45.50',
    payment_status: 'completed',
    payment_method: 'credit_card',
    shipping_method: 'HOME',
    shipping_address: 'Λεωφ. Κηφισίας 123',
    city: 'Αθήνα',
    postal_code: '11523',
    notes: 'Παράδοση σε ώρες γραφείου',
    created_at: '2025-09-16T10:30:00Z',
    items: [
      {
        id: 2001,
        product_id: 101,
        quantity: 2,
        price: '15.75',
        product_name: 'Ελαιόλαδο Κρήτης',
        product_unit: 'λίτρο'
      },
      {
        id: 2002,
        product_id: 102,
        quantity: 1,
        price: '14.00',
        product_name: 'Μέλι Υμηττού',
        product_unit: 'κιλό'
      }
    ]
  }
];

async function setupOrderManagementMocks(page: Page) {
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

  await page.route('**/api/v1/orders', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ orders: mockOrders })
  }));

  await page.route('**/api/admin/orders/*/update-status', route => {
    const url = route.request().url();
    const orderId = url.match(/\/orders\/(\d+)\/update-status/)?.[1];

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Η κατάσταση της παραγγελίας ενημερώθηκε επιτυχώς',
        order: {
          id: parseInt(orderId || '0'),
          status: 'shipped',
          updated_at: new Date().toISOString()
        }
      })
    });
  });
}

test.describe('Order Management - Admin Workflow', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock admin user authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'admin_mock_token');
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_email', 'admin@dixis.local');
    });

    await setupOrderManagementMocks(page);
  });

  test('Admin can view and update order status', async ({ page }) => {
    // Navigate to admin orders page
    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    // Wait for orders table to load
    await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('#1001')).toBeVisible({ timeout: 10000 });

    // Verify order information is displayed
    await expect(page.getByText('€45.50')).toBeVisible();
    await expect(page.getByText('Πληρωμένη')).toBeVisible();

    // Find the status update dropdown for order 1001
    const statusDropdown = page.locator('select').first();
    await expect(statusDropdown).toBeVisible();

    // Change status to 'shipped'
    await statusDropdown.selectOption('shipped');

    // Verify status update completed (check for status badge, not toast)
    await expect(page.locator('.bg-indigo-100').getByText('Αποστολή')).toBeVisible({ timeout: 5000 });
  });

  test('Admin sees validation error for invalid status transition', async ({ page }) => {
    // Navigate to admin orders page
    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByText('Διαχείριση Παραγγελιών')).toBeVisible({ timeout: 10000 });

    // Mock invalid transition response
    await page.route('**/api/admin/orders/*/update-status', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Η μετάβαση από "paid" σε "cancelled" δεν επιτρέπεται'
        })
      });
    });

    // Set up alert handler to capture validation error
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('δεν επιτρέπεται');
      await dialog.accept();
    });

    // Try to make an invalid transition (this would trigger client-side validation)
    const statusDropdown = page.locator('select').first();
    await statusDropdown.selectOption('cancelled');
  });
});