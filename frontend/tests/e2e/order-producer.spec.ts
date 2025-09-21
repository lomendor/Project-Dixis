import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Order Management Tests - Producer Workflow
 * Verifies producer shipping functionality
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
      }
    ]
  },
  {
    id: 1002,
    user_id: 502,
    status: 'paid',
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

    // Look for an order that can be shipped (paid status)
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
      // await page.waitForTimeout(...); // replaced
await page.waitForLoadState("networkidle");

      // The button should disappear or change after successful shipping
      await expect(shipButton).not.toBeVisible({ timeout: 5000 });
    } else {
      // Order might already be shipped or in wrong status
      await expect(page.getByText('Σε αποστολή')).toBeVisible();
    }
  });

  test('Producer only sees orders available for shipping', async ({ page }) => {
    // Navigate to producer orders page
    await page.goto('/producer/orders', { waitUntil: 'domcontentloaded' });

    // Wait for orders page to load
    await expect(page.getByText('Παραγγελίες Προς Αποστολή')).toBeVisible({ timeout: 10000 });

    // Verify that we see paid orders (ready for shipping)
    await expect(page.getByText('#1001')).toBeVisible();
    await expect(page.getByText('#1002')).toBeVisible();

    // Verify orders have shipping buttons available
    const shipButtons = page.getByText('Σημείωση ως Απεσταλμένη');
    await expect(shipButtons.first()).toBeVisible();
  });
});