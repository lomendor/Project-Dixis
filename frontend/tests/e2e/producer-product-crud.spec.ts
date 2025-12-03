import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Producer Product CRUD Operations
 * Tests the full product lifecycle: create, read, update, delete
 */
test.describe('Producer Product CRUD', () => {
  // Sample product data for testing
  const testProduct = {
    id: 1,
    name: 'Test Product',
    title: 'Βιολογικές Ντομάτες',
    price: 3.50,
    currency: 'EUR',
    stock: 25,
    is_active: true,
    status: 'available' as const,
    category: 'Λαχανικά',
    unit: 'kg',
    description: 'Φρέσκες βιολογικές ντομάτες από την Κρήτη',
    image_url: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  test.beforeEach(async ({ context, page }) => {
    // Clear cookies for clean state
    await context.clearCookies();

    // Mock producer authentication profile
    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 100,
          name: 'Test Producer',
          email: 'producer@test.com',
          role: 'producer',
          created_at: '2025-01-01T00:00:00Z',
        }),
      });
    });

    // Mock producer status - approved producer
    await page.route('**/api/producer/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'active',
          profile: { id: 1, name: 'Test Producer' },
        }),
      });
    });
  });

  test.describe('Product List', () => {
    test('displays product list when producer is approved', async ({ page }) => {
      // Mock products API
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [testProduct] }),
        });
      });

      await page.goto('/my/products');

      // Verify page title
      await expect(page.getByTestId('page-title')).toContainText('Διαχείριση Προϊόντων');

      // Verify product table is visible
      await expect(page.getByTestId('products-table')).toBeVisible();

      // Verify product row exists
      await expect(page.getByTestId('product-row-1')).toBeVisible();
      await expect(page.getByTestId('product-name-1')).toContainText('Βιολογικές Ντομάτες');
      await expect(page.getByTestId('product-price-1')).toContainText('3.50');
      await expect(page.getByTestId('product-stock-1')).toContainText('25');
    });

    test('shows empty state when no products exist', async ({ page }) => {
      // Mock empty products
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [] }),
        });
      });

      await page.goto('/my/products');

      // Verify empty state
      await expect(page.getByTestId('no-products-state')).toBeVisible();
      await expect(page.getByTestId('add-first-product-btn')).toBeVisible();
    });

    test('shows pending approval notice for unapproved producer', async ({ page }) => {
      // Override producer status to pending
      await page.route('**/api/producer/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'pending',
            profile: { id: 1, name: 'Test Producer' },
          }),
        });
      });

      await page.goto('/my/products');

      // Verify pending notice
      await expect(page.getByTestId('not-approved-notice')).toBeVisible();
      await expect(page.getByTestId('pending-approval-title')).toContainText('Αναμένεται Έγκριση');
    });
  });

  test.describe('Create Product', () => {
    test('navigates to create page from product list', async ({ page }) => {
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [] }),
        });
      });

      await page.goto('/my/products');

      // Click add product button
      await page.getByTestId('add-product-btn').click();

      // Verify navigation to create page
      await expect(page).toHaveURL(/\/producer\/products\/create/);
      await expect(page.getByTestId('page-title')).toContainText('Νέο Προϊόν');
    });

    test('creates product with valid data', async ({ page }) => {
      let createdProduct: Record<string, unknown> | null = null;

      // Mock POST to capture and verify data
      await page.route('**/api/me/products', async (route) => {
        if (route.request().method() === 'POST') {
          createdProduct = await route.request().postDataJSON();
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 1, ...createdProduct }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ products: [] }),
          });
        }
      });

      await page.goto('/producer/products/create');

      // Fill form
      await page.getByTestId('title-input').fill('Βιολογικές Ντομάτες');
      await page.getByTestId('slug-input').fill('biologikes-tomates');
      await page.getByTestId('category-select').selectOption('Λαχανικά');
      await page.getByTestId('unit-select').selectOption('kg');
      await page.getByTestId('description-textarea').fill('Φρέσκες ντομάτες');
      await page.getByTestId('price-input').fill('3.50');
      await page.getByTestId('stock-input').fill('25');

      // Submit form
      await page.getByTestId('submit-btn').click();

      // Verify redirect to product list
      await expect(page).toHaveURL(/\/producer\/products/);

      // Verify data was sent correctly
      expect(createdProduct).toMatchObject({
        title: 'Βιολογικές Ντομάτες',
        slug: 'biologikes-tomates',
        category: 'Λαχανικά',
        unit: 'kg',
        price: 3.50,
        stock: 25,
      });
    });

    test('shows validation errors for required fields', async ({ page }) => {
      await page.goto('/producer/products/create');

      // Try to submit empty form
      await page.getByTestId('submit-btn').click();

      // Browser native validation should prevent submission
      // Check that form fields have required attribute
      await expect(page.getByTestId('title-input')).toHaveAttribute('required', '');
      await expect(page.getByTestId('slug-input')).toHaveAttribute('required', '');
      await expect(page.getByTestId('category-select')).toHaveAttribute('required', '');
      await expect(page.getByTestId('unit-select')).toHaveAttribute('required', '');
      await expect(page.getByTestId('price-input')).toHaveAttribute('required', '');
      await expect(page.getByTestId('stock-input')).toHaveAttribute('required', '');
    });

    test('shows server error on API failure', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/me/products', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Αποτυχία δημιουργίας προϊόντος' }),
          });
        }
      });

      await page.goto('/producer/products/create');

      // Fill minimum required fields
      await page.getByTestId('title-input').fill('Test');
      await page.getByTestId('slug-input').fill('test');
      await page.getByTestId('category-select').selectOption('Λαχανικά');
      await page.getByTestId('unit-select').selectOption('kg');
      await page.getByTestId('price-input').fill('1');
      await page.getByTestId('stock-input').fill('1');

      // Submit
      await page.getByTestId('submit-btn').click();

      // Verify error message
      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page.getByTestId('error-message')).toContainText('Αποτυχία');
    });

    test('cancel button returns to product list', async ({ page }) => {
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [] }),
        });
      });

      await page.goto('/my/products');
      await page.getByTestId('add-product-btn').click();
      await page.getByTestId('cancel-btn').click();

      await expect(page).toHaveURL(/\/my\/products/);
    });
  });

  test.describe('Delete Product', () => {
    test('opens delete confirmation modal', async ({ page }) => {
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [testProduct] }),
        });
      });

      await page.goto('/my/products');

      // Click delete button
      await page.getByTestId('delete-product-1').click();

      // Verify modal appears
      await expect(page.getByTestId('delete-modal')).toBeVisible();
      await expect(page.getByTestId('delete-modal-title')).toContainText('Επιβεβαίωση Διαγραφής');
      await expect(page.getByTestId('delete-modal-message')).toContainText('Βιολογικές Ντομάτες');
    });

    test('cancels delete when clicking cancel', async ({ page }) => {
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [testProduct] }),
        });
      });

      await page.goto('/my/products');

      // Open and cancel delete
      await page.getByTestId('delete-product-1').click();
      await page.getByTestId('delete-modal-cancel').click();

      // Modal should close, product should still exist
      await expect(page.getByTestId('delete-modal')).not.toBeVisible();
      await expect(page.getByTestId('product-row-1')).toBeVisible();
    });

    test('deletes product on confirmation', async ({ page }) => {
      let deleteRequested = false;

      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: deleteRequested ? [] : [testProduct] }),
        });
      });

      await page.route('**/api/me/products/1', async (route) => {
        if (route.request().method() === 'DELETE') {
          deleteRequested = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        }
      });

      await page.goto('/my/products');

      // Confirm delete
      await page.getByTestId('delete-product-1').click();
      await page.getByTestId('delete-modal-confirm').click();

      // Modal should close and product should be gone
      await expect(page.getByTestId('delete-modal')).not.toBeVisible();
      await expect(page.getByTestId('no-products-state')).toBeVisible();
    });
  });

  test.describe('Edit Product', () => {
    test('navigates to edit page', async ({ page }) => {
      await page.route('**/api/me/products', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ products: [testProduct] }),
        });
      });

      await page.goto('/my/products');

      // Click edit button
      await page.getByTestId('edit-product-1').click();

      // Verify navigation
      await expect(page).toHaveURL(/\/producer\/products\/1\/edit/);
    });
  });
});
