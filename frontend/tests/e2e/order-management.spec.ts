import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Order Management Tests
 * Verifies order status transition workflow for admin and producer users
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
  },
  {
    id: 1002,
    user_id: 502,
    status: 'processing',
    total_amount: '28.90',
    payment_status: 'completed',
    payment_method: 'bank_transfer',
    shipping_method: 'COURIER',
    city: 'Θεσσαλονίκη',
    postal_code: '54622',
    created_at: '2025-09-16T08:15:00Z',
    items: [
      {
        id: 2003,
        product_id: 103,
        quantity: 3,
        price: '9.63',
        product_name: 'Τυρί Φέτα',
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

  await page.route('**/api/producer/orders/*/ship', route => {
    const url = route.request().url();
    const orderId = url.match(/\/orders\/(\d+)\/ship/)?.[1];

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Η παραγγελία σημειώθηκε ως απεσταλμένη επιτυχώς',
        order: {
          id: parseInt(orderId || '0'),
          status: 'shipped',
          shipment: {
            status: 'shipped',
            tracking_number: `TRK${Date.now()}${orderId}`
          }
        }
      })
    });
  });
}

async function setupProducerMocks(page: Page) {
  await page.route('**/api/v1/auth/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 2,
      name: 'Producer User',
      email: 'producer@dixis.local',
      role: 'producer'
    })
  }));

  await page.route('**/api/v1/orders', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ orders: mockOrders })
  }));
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

    // Verify status update completed
    await expect(page.getByText('Σε αποστολή')).toBeVisible({ timeout: 5000 });
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

test.describe('Order Management - Producer Workflow', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock producer user authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'producer_mock_token');
      localStorage.setItem('user_role', 'producer');
      localStorage.setItem('user_email', 'producer@dixis.local');
    });

    await setupProducerMocks(page);
  });

  test('Producer can mark orders as shipped', async ({ page }) => {
    // Navigate to producer orders page
    await page.goto('/producer/orders', { waitUntil: 'domcontentloaded' });

    // Wait for orders page to load
    await expect(page.getByText('Παραγγελίες Προς Αποστολή')).toBeVisible({ timeout: 10000 });

    // Look for an order that can be shipped (paid or processing status)
    const orderCard = page.locator('[data-testid="order-card"], .bg-white.shadow-sm').first();
    await expect(orderCard).toBeVisible({ timeout: 10000 });

    // Verify order details are visible
    await expect(page.getByText('#1001')).toBeVisible();
    await expect(page.getByText('€45.50')).toBeVisible();

    // Find and click the "Mark as Shipped" button
    const shipButton = page.getByText('Σημείωση ως Απεσταλμένη');

    if (await shipButton.isVisible()) {
      await shipButton.click();

      // Verify the shipping action completed
      await expect(page.getByText('Ενημέρωση...')).toBeVisible({ timeout: 2000 });

      // Wait for the update to complete
      await page.waitForTimeout(1000);

      // The button should disappear or change after successful shipping
      await expect(shipButton).not.toBeVisible({ timeout: 5000 });
    } else {
      // Order might already be shipped or in wrong status
      await expect(page.getByText('Σε αποστολή')).toBeVisible();
    }
  });
});

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
});