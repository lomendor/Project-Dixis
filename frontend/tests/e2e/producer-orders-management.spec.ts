import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth';

/**
 * E2E Producer Orders Management Tests - AG126
 * Tests producer order list, details, and status update functionality
 */

const mockOrders = [
  {
    id: 101,
    user_id: 201,
    status: 'pending',
    payment_status: 'completed',
    payment_method: 'card',
    subtotal: '45.00',
    shipping_cost: '5.00',
    total: '50.00',
    currency: 'EUR',
    created_at: '2025-11-26T10:30:00Z',
    updated_at: '2025-11-26T10:30:00Z',
    user: {
      id: 201,
      name: 'Γιώργος Παπαδόπουλος',
      email: 'customer1@test.com'
    },
    orderItems: [
      {
        id: 1001,
        product_id: 1,
        quantity: 2,
        unit_price: '22.50',
        total_price: '45.00',
        product_name: 'Ελαιόλαδο Κρήτης',
        product_unit: 'λίτρο',
        product: { name: 'Ελαιόλαδο Κρήτης' }
      }
    ]
  },
  {
    id: 102,
    user_id: 202,
    status: 'processing',
    payment_status: 'completed',
    payment_method: 'card',
    subtotal: '30.00',
    shipping_cost: '5.00',
    total: '35.00',
    currency: 'EUR',
    created_at: '2025-11-25T14:15:00Z',
    updated_at: '2025-11-25T14:15:00Z',
    user: {
      id: 202,
      name: 'Μαρία Νικολάου',
      email: 'customer2@test.com'
    },
    orderItems: [
      {
        id: 1002,
        product_id: 2,
        quantity: 3,
        unit_price: '10.00',
        total_price: '30.00',
        product_name: 'Μέλι Θυμαριού',
        product_unit: 'βάζο',
        product: { name: 'Μέλι Θυμαριού' }
      }
    ]
  },
  {
    id: 103,
    user_id: 203,
    status: 'shipped',
    payment_status: 'completed',
    payment_method: 'cod',
    subtotal: '60.00',
    shipping_cost: '0.00',
    total: '60.00',
    currency: 'EUR',
    created_at: '2025-11-24T09:00:00Z',
    updated_at: '2025-11-24T12:00:00Z',
    user: {
      id: 203,
      name: 'Κώστας Αντωνίου',
      email: 'customer3@test.com'
    },
    orderItems: [
      {
        id: 1003,
        product_id: 3,
        quantity: 4,
        unit_price: '15.00',
        total_price: '60.00',
        product_name: 'Τυρί Φέτα ΠΟΠ',
        product_unit: 'κιλό',
        product: { name: 'Τυρί Φέτα ΠΟΠ' }
      }
    ]
  }
];

test.describe('Producer Orders Management - AG126', () => {
  let authHelper: AuthHelper;
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuthState();

    // Capture console errors for hydration regression check
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Mock producer authentication
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 100,
          name: 'Test Producer',
          email: 'producer@test.com',
          role: 'producer',
          created_at: '2025-01-01T00:00:00Z'
        })
      });
    });

    // Mock producer KPI for navigation
    await page.route('**/api/v1/producer/dashboard/kpi', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_products: 5,
          active_products: 4,
          total_orders: 3,
          revenue: 145.00,
          unread_messages: 0
        })
      });
    });
  });

  test('producer can view orders list with status counts', async ({ page }) => {
    // Mock producer orders API
    await page.route('**/api/v1/producer/orders**', async route => {
      const url = new URL(route.request().url());
      const statusFilter = url.searchParams.get('status');

      let filteredOrders = mockOrders;
      if (statusFilter) {
        filteredOrders = mockOrders.filter(o => o.status === statusFilter);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: filteredOrders,
          meta: {
            total: mockOrders.length,
            pending: mockOrders.filter(o => o.status === 'pending').length,
            processing: mockOrders.filter(o => o.status === 'processing').length,
            shipped: mockOrders.filter(o => o.status === 'shipped').length,
            delivered: mockOrders.filter(o => o.status === 'delivered').length
          }
        })
      });
    });

    // Authenticate as producer
    await authHelper.loginAsProducer();

    // Navigate to producer orders page
    await page.goto('/producer/orders');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Παραγγελίες' })).toBeVisible();

    // Verify status filter tabs are visible
    await expect(page.getByRole('button', { name: /Όλες \(3\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Σε Εκκρεμότητα \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Σε Επεξεργασία \(1\)/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Απεσταλμένες \(1\)/ })).toBeVisible();

    // Verify orders are displayed
    await expect(page.getByText('Παραγγελία #101')).toBeVisible();
    await expect(page.getByText('Παραγγελία #102')).toBeVisible();
    await expect(page.getByText('Παραγγελία #103')).toBeVisible();
  });

  test('producer can filter orders by status', async ({ page }) => {
    // Mock producer orders API with filtering
    await page.route('**/api/v1/producer/orders**', async route => {
      const url = new URL(route.request().url());
      const statusFilter = url.searchParams.get('status');

      let filteredOrders = mockOrders;
      if (statusFilter) {
        filteredOrders = mockOrders.filter(o => o.status === statusFilter);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: filteredOrders,
          meta: {
            total: mockOrders.length,
            pending: 1,
            processing: 1,
            shipped: 1,
            delivered: 0
          }
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders');

    // Click on "Σε Εκκρεμότητα" filter
    await page.getByRole('button', { name: /Σε Εκκρεμότητα/ }).click();

    // Should only show pending orders
    await expect(page.getByText('Παραγγελία #101')).toBeVisible();

    // Click on "Σε Επεξεργασία" filter
    await page.getByRole('button', { name: /Σε Επεξεργασία/ }).click();

    // Wait for the filter to apply
    await page.waitForTimeout(500);
  });

  test('producer can navigate to order details', async ({ page }) => {
    // Mock producer orders list
    await page.route('**/api/v1/producer/orders', async route => {
      if (!route.request().url().includes('/101')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            orders: mockOrders,
            meta: {
              total: 3,
              pending: 1,
              processing: 1,
              shipped: 1,
              delivered: 0
            }
          })
        });
      }
    });

    // Mock single order details
    await page.route('**/api/v1/producer/orders/101', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: mockOrders[0]
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders');

    // Click on the first order
    await page.getByText('Παραγγελία #101').click();

    // Verify we navigated to order details
    await expect(page).toHaveURL(/\/producer\/orders\/101/);

    // Verify order details are displayed
    await expect(page.getByRole('heading', { name: 'Παραγγελία #101' })).toBeVisible();
    await expect(page.getByText('Γιώργος Παπαδόπουλος')).toBeVisible();
    await expect(page.getByText('customer1@test.com')).toBeVisible();
    await expect(page.getByText('Ελαιόλαδο Κρήτης')).toBeVisible();
  });

  test('producer can update order status from pending to processing', async ({ page }) => {
    let currentStatus = 'pending';

    // Mock single order details
    await page.route('**/api/v1/producer/orders/101', async route => {
      const order = { ...mockOrders[0], status: currentStatus };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order
        })
      });
    });

    // Mock status update API
    await page.route('**/api/v1/producer/orders/101/status', async route => {
      if (route.request().method() === 'PATCH') {
        const body = await route.request().postDataJSON();
        currentStatus = body.status;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Η κατάσταση ενημερώθηκε',
            order: { ...mockOrders[0], status: currentStatus }
          })
        });
      }
    });

    // Mock email notification API (fire and forget)
    await page.route('**/api/producer/orders/101/status', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            dryRun: true
          })
        });
      }
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/101');

    // Verify pending status badge
    await expect(page.getByText('Σε Εκκρεμότητα')).toBeVisible();

    // Click status update button
    await page.getByRole('button', { name: 'Ξεκίνησε Επεξεργασία' }).click();

    // Wait for update to complete
    await expect(page.getByText('Σε Επεξεργασία')).toBeVisible({ timeout: 5000 });
  });

  test('order details shows customer information', async ({ page }) => {
    // Mock single order details
    await page.route('**/api/v1/producer/orders/102', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: mockOrders[1]
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/102');

    // Verify customer info section
    await expect(page.getByText('Πληροφορίες Πελάτη')).toBeVisible();
    await expect(page.getByText('Μαρία Νικολάου')).toBeVisible();
    await expect(page.getByText('customer2@test.com')).toBeVisible();
  });

  test('order details shows order items and totals', async ({ page }) => {
    // Mock single order details
    await page.route('**/api/v1/producer/orders/103', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: mockOrders[2]
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/103');

    // Verify order items
    await expect(page.getByText('Προϊόντα (1)')).toBeVisible();
    await expect(page.getByText('Τυρί Φέτα ΠΟΠ')).toBeVisible();
    await expect(page.getByText(/4 ×/)).toBeVisible();

    // Verify totals section
    await expect(page.getByText('Υποσύνολο')).toBeVisible();
  });

  test('producer can navigate back to orders list', async ({ page }) => {
    // Mock orders list
    await page.route('**/api/v1/producer/orders', async route => {
      if (!route.request().url().includes('/101')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            orders: mockOrders,
            meta: { total: 3, pending: 1, processing: 1, shipped: 1, delivered: 0 }
          })
        });
      }
    });

    // Mock single order
    await page.route('**/api/v1/producer/orders/101', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: mockOrders[0]
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/101');

    // Click back link
    await page.getByText('Πίσω στις Παραγγελίες').click();

    // Verify navigation back to list
    await expect(page).toHaveURL(/\/producer\/orders$/);
    await expect(page.getByRole('heading', { name: 'Παραγγελίες' })).toBeVisible();
  });

  test('delivered orders do not show status update button', async ({ page }) => {
    const deliveredOrder = {
      ...mockOrders[2],
      id: 104,
      status: 'delivered'
    };

    // Mock delivered order
    await page.route('**/api/v1/producer/orders/104', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: deliveredOrder
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/104');

    // Verify delivered status
    await expect(page.getByText('Παραδομένη')).toBeVisible();

    // Status update section should not be visible
    await expect(page.getByText('Ενημέρωση Κατάστασης')).not.toBeVisible();
  });

  test('shows email sent status after status update', async ({ page }) => {
    let currentStatus = 'pending';

    // Mock single order details
    await page.route('**/api/v1/producer/orders/101', async route => {
      const order = { ...mockOrders[0], status: currentStatus };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, order })
      });
    });

    // Mock status update API
    await page.route('**/api/v1/producer/orders/101/status', async route => {
      if (route.request().method() === 'PATCH') {
        currentStatus = 'processing';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Status updated',
            order: { ...mockOrders[0], status: currentStatus }
          })
        });
      }
    });

    // Mock email notification API - success
    await page.route('**/api/producer/orders/101/status', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            dryRun: false,
            message: 'Email sent successfully'
          })
        });
      }
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/101');

    // Click status update button
    await page.getByRole('button', { name: 'Ξεκίνησε Επεξεργασία' }).click();

    // Verify email sent status appears
    await expect(page.getByText('Email ειδοποίησης στάλθηκε')).toBeVisible({ timeout: 5000 });
  });

  test('shows email failed status with retry button', async ({ page }) => {
    let currentStatus = 'pending';

    // Mock single order details
    await page.route('**/api/v1/producer/orders/101', async route => {
      const order = { ...mockOrders[0], status: currentStatus };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, order })
      });
    });

    // Mock status update API
    await page.route('**/api/v1/producer/orders/101/status', async route => {
      if (route.request().method() === 'PATCH') {
        currentStatus = 'processing';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Status updated',
            order: { ...mockOrders[0], status: currentStatus }
          })
        });
      }
    });

    // Mock email notification API - failure
    await page.route('**/api/producer/orders/101/status', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Email service unavailable'
          })
        });
      }
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders/101');

    // Click status update button
    await page.getByRole('button', { name: 'Ξεκίνησε Επεξεργασία' }).click();

    // Verify email failed status appears
    await expect(page.getByText('Αποτυχία αποστολής email')).toBeVisible({ timeout: 5000 });

    // Verify retry button is visible
    await expect(page.getByRole('button', { name: 'Επανάληψη' })).toBeVisible();
  });

  test('producer orders page loads without hydration error (regression)', async ({ page }) => {
    // Mock producer orders API
    await page.route('**/api/v1/producer/orders**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orders: mockOrders,
          meta: {
            total: mockOrders.length,
            pending: 1,
            processing: 1,
            shipped: 1,
            delivered: 0
          }
        })
      });
    });

    await authHelper.loginAsProducer();
    await page.goto('/producer/orders');

    // Wait for page to fully load
    await expect(page.getByRole('heading', { name: 'Παραγγελίες' })).toBeVisible();

    // CRITICAL: Verify error boundary is NOT shown (regression for hydration fix)
    await expect(page.getByText('Σφάλμα στην Περιοχή Παραγωγού')).not.toBeVisible();

    // Verify orders list root is visible
    await expect(page.getByText('Παραγγελία #101')).toBeVisible();

    // Check no React #418 hydration error in console
    const hydrationErrors = consoleErrors.filter(e => e.includes('418') || e.includes('Hydration'));
    expect(hydrationErrors).toHaveLength(0);
  });
});
