import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Customer Orders Tests
 * Verifies customer order history and details functionality
 */

const mockOrders = [
  {
    id: 1001,
    status: 'delivered',
    total_amount: '45.50',
    created_at: '2025-09-10T14:30:00Z',
    items: [
      {
        id: 2001,
        product_name: 'Ελαιόλαδο Κρήτης',
        quantity: 2,
        price: '15.75'
      },
      {
        id: 2002,
        product_name: 'Μέλι Υμηττού',
        quantity: 1,
        price: '14.00'
      }
    ]
  },
  {
    id: 1002,
    status: 'shipped',
    total_amount: '28.90',
    created_at: '2025-09-14T09:15:00Z',
    items: [
      {
        id: 2003,
        product_name: 'Τυρί Φέτα',
        quantity: 3,
        price: '9.63'
      }
    ]
  }
];

const mockOrderDetails = {
  id: 1001,
  status: 'delivered',
  total_amount: '45.50',
  subtotal: '42.50',
  tax_amount: '3.00',
  shipping_amount: '0.00',
  payment_method: 'Πιστωτική κάρτα',
  shipping_method: 'Παράδοση στο σπίτι',
  shipping_address: 'Λεωφ. Κηφισίας 123',
  city: 'Αθήνα',
  postal_code: '11523',
  created_at: '2025-09-10T14:30:00Z',
  items: [
    {
      id: 2001,
      product_id: 101,
      product_name: 'Ελαιόλαδο Κρήτης',
      quantity: 2,
      unit_price: '15.75',
      total_price: '31.50',
      product_unit: 'λίτρο'
    },
    {
      id: 2002,
      product_id: 102,
      product_name: 'Μέλι Υμηττού',
      quantity: 1,
      unit_price: '14.00',
      total_price: '14.00',
      product_unit: 'κιλό'
    }
  ],
  statusTimeline: [
    {
      status: 'delivered',
      timestamp: '2025-09-12T11:45:00Z',
      description: 'Η παραγγελία παραδόθηκε επιτυχώς'
    },
    {
      status: 'paid',
      timestamp: '2025-09-10T14:35:00Z',
      description: 'Η πληρωμή ολοκληρώθηκε'
    }
  ]
};

async function setupAccountOrdersMocks(page: Page) {
  await page.route('**/api/v1/auth/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 1,
      name: 'Test Consumer',
      email: 'consumer@dixis.local',
      role: 'consumer'
    })
  }));

  await page.route('**/api/account/orders**', route => {
    const url = new URL(route.request().url());
    const page = url.searchParams.get('page') || '1';

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: mockOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalOrders: mockOrders.length,
          perPage: 10
        }
      })
    });
  });

  await page.route('**/api/account/orders/1001', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockOrderDetails)
  }));

  await page.route('**/api/account/orders/999', route => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Η παραγγελία δεν βρέθηκε' })
  }));

  await page.route('**/api/account/orders/1003', route => route.fulfill({
    status: 403,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτή την παραγγελία' })
  }));
}

test.describe('Customer Orders - Order History', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock consumer authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@dixis.local');
    });

    await setupAccountOrdersMocks(page);
  });

  test('Customer can view order history', async ({ page }) => {
    // Navigate to account orders page
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });

    // Wait for orders page to load
    await expect(page.getByText('Οι Παραγγελίες μου')).toBeVisible({ timeout: 10000 });

    // Verify order cards are displayed
    await expect(page.getByText('Παραγγελία #1001')).toBeVisible();
    await expect(page.getByText('Παραγγελία #1002')).toBeVisible();

    // Verify order amounts
    await expect(page.getByText('€45.50')).toBeVisible();
    await expect(page.getByText('€28.90')).toBeVisible();

    // Verify status badges
    await expect(page.getByText('Παραδόθηκε')).toBeVisible();
    await expect(page.getByText('Αποστολή')).toBeVisible();

    // Verify product count display
    await expect(page.getByText('2 προϊόντα')).toBeVisible();
    await expect(page.getByText('1 προϊόν')).toBeVisible();

    // Verify "View Details" links exist
    const detailsLinks = page.getByText('Προβολή λεπτομερειών');
    await expect(detailsLinks.first()).toBeVisible();
  });

  test('Customer can navigate to order details', async ({ page }) => {
    // Navigate to account orders page
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });

    // Wait for orders to load
    await expect(page.getByText('Παραγγελία #1001')).toBeVisible({ timeout: 10000 });

    // Click on "View Details" for the first order
    const firstDetailsLink = page.getByText('Προβολή λεπτομερειών').first();
    await firstDetailsLink.click();

    // Verify navigation to order details page
    await expect(page).toHaveURL(/\/account\/orders\/1001$/);
    await expect(page.getByText('Παραγγελία #1001')).toBeVisible({ timeout: 10000 });
  });

  test('Empty state shows when no orders exist', async ({ page }) => {
    // Mock empty orders response
    await page.route('**/api/account/orders**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orders: [],
        pagination: { currentPage: 1, totalPages: 0, totalOrders: 0, perPage: 10 }
      })
    }));

    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });

    // Verify empty state
    await expect(page.getByText('Δεν έχετε κάνει ακόμα παραγγελίες')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Αρχίστε τις αγορές')).toBeVisible();
  });
});

test.describe('Customer Orders - Order Details', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_consumer_token');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@dixis.local');
    });

    await setupAccountOrdersMocks(page);
  });

  test('Customer can view order details', async ({ page }) => {
    // Navigate directly to order details page
    await page.goto('/account/orders/1001', { waitUntil: 'domcontentloaded' });

    // Wait for order details to load
    await expect(page.getByText('Παραγγελία #1001')).toBeVisible({ timeout: 10000 });

    // Verify order status badge
    await expect(page.getByText('Παραδόθηκε')).toBeVisible();

    // Verify order items section
    await expect(page.getByText('Προϊόντα')).toBeVisible();
    await expect(page.getByText('Ελαιόλαδο Κρήτης')).toBeVisible();
    await expect(page.getByText('Μέλι Υμηττού')).toBeVisible();

    // Verify quantities and prices
    await expect(page.getByText('2 λίτρο × €15.75')).toBeVisible();
    await expect(page.getByText('1 κιλό × €14.00')).toBeVisible();

    // Verify order totals
    await expect(page.getByText('Σύνολο Παραγγελίας')).toBeVisible();
    await expect(page.getByText('€42.50')).toBeVisible(); // subtotal
    await expect(page.getByText('€45.50')).toBeVisible(); // total

    // Verify payment and shipping information
    await expect(page.getByText('Στοιχεία Παραγγελίας')).toBeVisible();
    await expect(page.getByText('Πιστωτική κάρτα')).toBeVisible();
    await expect(page.getByText('Παράδοση στο σπίτι')).toBeVisible();

    // Verify shipping address
    await expect(page.getByText('Λεωφ. Κηφισίας 123')).toBeVisible();
    await expect(page.getByText('Αθήνα, 11523')).toBeVisible();

    // Verify status timeline
    await expect(page.getByText('Ιστορικό Κατάστασης')).toBeVisible();
    await expect(page.getByText('Η παραγγελία παραδόθηκε επιτυχώς')).toBeVisible();
  });

  test('Order not found shows error message', async ({ page }) => {
    // Navigate to non-existent order
    await page.goto('/account/orders/999', { waitUntil: 'domcontentloaded' });

    // Verify error message
    await expect(page.getByText('Η παραγγελία δεν βρέθηκε')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Επιστροφή στις παραγγελίες')).toBeVisible();
  });

  test('Unauthorized access to order shows error', async ({ page }) => {
    // Navigate to order belonging to another user
    await page.goto('/account/orders/1003', { waitUntil: 'domcontentloaded' });

    // Verify unauthorized access error
    await expect(page.getByText('Δεν έχετε δικαίωμα πρόσβασης σε αυτή την παραγγελία')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Επιστροφή στις παραγγελίες')).toBeVisible();
  });

  test('Back to orders link works correctly', async ({ page }) => {
    // Navigate to order details
    await page.goto('/account/orders/1001', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByText('Παραγγελία #1001')).toBeVisible({ timeout: 10000 });

    // Click back to orders link
    await page.getByText('← Επιστροφή στις παραγγελίες').click();

    // Verify navigation back to orders list
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByText('Οι Παραγγελίες μου')).toBeVisible({ timeout: 10000 });
  });
});