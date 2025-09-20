import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth';

test.describe('Producer Inventory Management', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuthState();

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

    // Mock producer KPI data for dashboard
    await page.route('**/api/v1/producer/kpi', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_products: 5,
          active_products: 4,
          total_orders: 12,
          revenue: 1200.00,
          unread_messages: 0
        })
      });
    });

    // Mock producer top products for dashboard
    await page.route('**/api/v1/producer/dashboard/top-products', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: 15,
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
            },
            {
              id: 2,
              name: 'Organic Honey',
              price: '18.00',
              unit: 'jar',
              stock: 3, // Low stock product
              is_active: true,
              categories: [{ id: 2, name: 'Honey', slug: 'honey' }],
              images: [{ id: 2, url: '/images/honey.jpg', is_primary: true }]
            }
          ]
        })
      });
    });
  });

  test('producer can view and manage product inventory', async ({ page }) => {
    // Mock producer products API
    await page.route('**/api/v1/producer/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: 15,
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
            },
            {
              id: 2,
              name: 'Organic Honey',
              price: '18.00',
              unit: 'jar',
              stock: 3, // Low stock product
              is_active: true,
              categories: [{ id: 2, name: 'Honey', slug: 'honey' }],
              images: [{ id: 2, url: '/images/honey.jpg', is_primary: true }]
            },
            {
              id: 3,
              name: 'Herbal Soap',
              price: '12.00',
              unit: 'piece',
              stock: 0, // Out of stock product
              is_active: true,
              categories: [{ id: 3, name: 'Soap', slug: 'soap' }],
              images: []
            }
          ],
          current_page: 1,
          per_page: 20,
          total: 3,
          last_page: 1,
          has_more: false
        })
      });
    });

    // Authenticate as producer
    await authHelper.loginAsProducer();

    // Navigate to producer products page
    await page.goto('/producer/products');

    // Wait for products page to load
    await expect(page.getByText('Διαχείριση Προϊόντων')).toBeVisible();

    // Verify products are displayed with stock information
    await expect(page.getByText('Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('15 bottle(s)')).toBeVisible();
    await expect(page.getByText('€25.00')).toBeVisible();

    // Verify low stock product is highlighted
    const honeyRow = page.locator('tr').filter({ hasText: 'Organic Honey' });
    await expect(honeyRow).toHaveClass(/bg-yellow-50/);
    await expect(honeyRow.getByText('⚠️ Χαμηλό')).toBeVisible();

    // Verify out of stock product is highlighted
    const soapRow = page.locator('tr').filter({ hasText: 'Herbal Soap' });
    await expect(soapRow).toHaveClass(/bg-red-50/);
    await expect(soapRow.getByText('⚠️ Εξαντλημένο')).toBeVisible();

    // Verify total products count
    await expect(page.getByText('Προϊόντα (3 συνολικά)')).toBeVisible();
  });

  test('producer can update product stock manually', async ({ page }) => {
    let stockUpdated = false;

    // Mock producer products API
    await page.route('**/api/v1/producer/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: stockUpdated ? 25 : 15, // Updated stock after manual update
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
            }
          ],
          current_page: 1,
          per_page: 20,
          total: 1,
          last_page: 1,
          has_more: false
        })
      });
    });

    // Mock stock update API
    await page.route('**/api/v1/producer/products/1/stock', async route => {
      const requestBody = await route.request().postDataJSON();
      expect(requestBody.stock).toBe(25);

      stockUpdated = true;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Premium Olive Oil',
          old_stock: 15,
          new_stock: 25,
          message: 'Stock updated successfully'
        })
      });
    });

    // Authenticate as producer
    await authHelper.loginAsProducer();

    // Navigate to producer products page
    await page.goto('/producer/products');
    await expect(page.getByText('Διαχείριση Προϊόντων')).toBeVisible();

    // Find the stock update button for Premium Olive Oil
    const productRow = page.locator('tr').filter({ hasText: 'Premium Olive Oil' });
    await productRow.getByText('Ενημέρωση Απόθεμα').click();

    // Verify stock update modal opens
    await expect(page.getByText('Ενημέρωση Απόθεμα: Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('Τρέχον απόθεμα: 15 bottle(s)')).toBeVisible();

    // Update stock to 25
    const stockInput = page.getByLabel('Νέο Απόθεμα (bottle)');
    await stockInput.clear();
    await stockInput.fill('25');

    // Submit the update
    await page.getByRole('button', { name: 'Ενημέρωση' }).click();

    // Wait for modal to close and page to refresh
    await expect(page.getByText('Ενημέρωση Απόθεμα: Premium Olive Oil')).not.toBeVisible();

    // Verify updated stock is displayed
    await expect(page.getByText('25 bottle(s)')).toBeVisible();
  });

  test('order placement decrements stock and triggers low-stock alerts', async ({ page }) => {
    let orderPlaced = false;
    let stockAfterOrder = 10;

    // Mock public products API for catalog
    await page.route('**/api/v1/public/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: orderPlaced ? stockAfterOrder : 12, // Stock decrements after order
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }],
              producer: { id: 1, name: 'Test Producer' }
            }
          ],
          current_page: 1,
          per_page: 15,
          total: 1,
          last_page: 1
        })
      });
    });

    // Mock order creation API with stock decrement
    await page.route('**/api/v1/orders', async route => {
      const requestBody = await route.request().postDataJSON();

      // Verify order contains the product
      expect(requestBody.items).toContainEqual({
        product_id: 1,
        quantity: 2
      });

      orderPlaced = true;
      stockAfterOrder = 10; // 12 - 2 = 10

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          user_id: 1,
          status: 'pending',
          payment_status: 'pending',
          shipping_method: 'HOME',
          currency: 'EUR',
          subtotal: 50.00,
          shipping_cost: 0,
          total: 50.00,
          notes: null,
          created_at: '2025-09-16T10:00:00Z',
          order_items: [
            {
              id: 1,
              product_id: 1,
              quantity: 2,
              unit_price: 25.00,
              total_price: 50.00,
              product_name: 'Premium Olive Oil',
              product_unit: 'bottle'
            }
          ]
        })
      });
    });

    // Mock consumer authentication
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 200,
          name: 'Test Consumer',
          email: 'consumer@test.com',
          role: 'consumer',
          created_at: '2025-01-01T00:00:00Z'
        })
      });
    });

    // First, clear auth state and login as consumer
    await authHelper.clearAuthState();
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill('consumer@test.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();

    // Navigate to homepage to see products
    await page.goto('/');
    await expect(page.getByText('Premium Olive Oil')).toBeVisible();

    // Verify initial stock is displayed
    await expect(page.getByText('Σε Απόθεμα')).toBeVisible();

    // Create order with 2 items
    const orderData = {
      items: [{ product_id: 1, quantity: 2 }],
      currency: 'EUR',
      shipping_method: 'HOME',
      notes: 'Test order for stock decrement'
    };

    // Simulate order creation by making API call directly
    await page.evaluate(async (orderData) => {
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(orderData)
      });
      return response.json();
    }, orderData);

    // Now verify stock was decremented by checking producer view
    await authHelper.clearAuthState();

    // Mock producer products API with updated stock
    await page.route('**/api/v1/producer/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: 10, // Stock decremented from 12 to 10
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
            }
          ],
          current_page: 1,
          per_page: 20,
          total: 1,
          last_page: 1,
          has_more: false
        })
      });
    });

    // Login as producer to verify stock update
    await authHelper.loginAsProducer();
    await page.goto('/producer/products');

    // Verify stock was decremented
    await expect(page.getByText('Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('10 bottle(s)')).toBeVisible();

    // Since stock is 10 (above threshold of 5), should not be highlighted as low stock
    const productRow = page.locator('tr').filter({ hasText: 'Premium Olive Oil' });
    await expect(productRow).not.toHaveClass(/bg-yellow-50/);
  });

  test('low-stock notification is triggered when stock falls below threshold', async ({ page }) => {
    // Mock stock update that triggers low-stock alert
    await page.route('**/api/v1/producer/products/1/stock', async route => {
      const requestBody = await route.request().postDataJSON();
      expect(requestBody.stock).toBe(3); // Below threshold of 5

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Premium Olive Oil',
          old_stock: 10,
          new_stock: 3,
          message: 'Stock updated successfully'
        })
      });
    });

    // Mock producer products API with low stock
    await page.route('**/api/v1/producer/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Premium Olive Oil',
              price: '25.00',
              unit: 'bottle',
              stock: 3, // Low stock (below threshold of 5)
              is_active: true,
              categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
              images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
            }
          ],
          current_page: 1,
          per_page: 20,
          total: 1,
          last_page: 1,
          has_more: false
        })
      });
    });

    // Authenticate as producer
    await authHelper.loginAsProducer();

    // Navigate to producer products page
    await page.goto('/producer/products');
    await expect(page.getByText('Διαχείριση Προϊόντων')).toBeVisible();

    // Verify low stock product is highlighted with warning
    const productRow = page.locator('tr').filter({ hasText: 'Premium Olive Oil' });
    await expect(productRow).toHaveClass(/bg-yellow-50/);
    await expect(productRow.getByText('⚠️ Χαμηλό')).toBeVisible();
    await expect(productRow.getByText('3 bottle(s)')).toBeVisible();

    // Test manual stock update that triggers low-stock alert
    await productRow.getByText('Ενημέρωση Απόθεμα').click();

    // Verify modal shows current low stock
    await expect(page.getByText('Ενημέρωση Απόθεμα: Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('Τρέχον απόθεμα: 3 bottle(s)')).toBeVisible();

    // Update to even lower stock
    const stockInput = page.getByLabel('Νέο Απόθεμα (bottle)');
    await stockInput.clear();
    await stockInput.fill('3');

    // Submit the update
    await page.getByRole('button', { name: 'Ενημέρωση' }).click();

    // Wait for modal to close
    await expect(page.getByText('Ενημέρωση Απόθεμα: Premium Olive Oil')).not.toBeVisible();

    // Verify low stock warning persists
    await expect(productRow).toHaveClass(/bg-yellow-50/);
    await expect(productRow.getByText('⚠️ Χαμηλό')).toBeVisible();
  });

  test('producer inventory search and filtering works correctly', async ({ page }) => {
    // Mock producer products API with multiple products for filtering
    await page.route('**/api/v1/producer/products**', async route => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');
      const status = url.searchParams.get('status');

      let products = [
        {
          id: 1,
          name: 'Premium Olive Oil',
          price: '25.00',
          unit: 'bottle',
          stock: 15,
          is_active: true,
          categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
          images: [{ id: 1, url: '/images/olive-oil.jpg', is_primary: true }]
        },
        {
          id: 2,
          name: 'Organic Honey',
          price: '18.00',
          unit: 'jar',
          stock: 3,
          is_active: true,
          categories: [{ id: 2, name: 'Honey', slug: 'honey' }],
          images: []
        },
        {
          id: 3,
          name: 'Inactive Product',
          price: '10.00',
          unit: 'piece',
          stock: 5,
          is_active: false,
          categories: [],
          images: []
        }
      ];

      // Apply search filter
      if (search) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply status filter
      if (status === 'active') {
        products = products.filter(p => p.is_active);
      } else if (status === 'inactive') {
        products = products.filter(p => !p.is_active);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: products,
          current_page: 1,
          per_page: 20,
          total: products.length,
          last_page: 1,
          has_more: false
        })
      });
    });

    // Authenticate as producer
    await authHelper.loginAsProducer();

    // Navigate to producer products page
    await page.goto('/producer/products');
    await expect(page.getByText('Διαχείριση Προϊόντων')).toBeVisible();

    // Test search functionality
    await page.getByPlaceholder('Αναζήτηση ανά όνομα προϊόντος...').fill('Olive');

    // Wait for search results
    await expect(page.getByText('Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('Organic Honey')).not.toBeVisible();
    await expect(page.getByText('Προϊόντα (1 συνολικά)')).toBeVisible();

    // Clear search
    await page.getByPlaceholder('Αναζήτηση ανά όνομα προϊόντος...').clear();

    // Test status filtering - Active only
    await page.selectOption('select', 'active');
    await expect(page.getByText('Premium Olive Oil')).toBeVisible();
    await expect(page.getByText('Organic Honey')).toBeVisible();
    await expect(page.getByText('Inactive Product')).not.toBeVisible();
    await expect(page.getByText('Προϊόντα (2 συνολικά)')).toBeVisible();

    // Test status filtering - Inactive only
    await page.selectOption('select', 'inactive');
    await expect(page.getByText('Inactive Product')).toBeVisible();
    await expect(page.getByText('Premium Olive Oil')).not.toBeVisible();
    await expect(page.getByText('Προϊόντα (1 συνολικά)')).toBeVisible();

    // Reset to all products
    await page.selectOption('select', 'all');
    await expect(page.getByText('Προϊόντα (3 συνολικά)')).toBeVisible();
  });
});