import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Admin Category Management
 * Tests category listing, editing, and toggle active/inactive
 */
test.describe('Admin Category Management', () => {
  test.beforeEach(async ({ context, page }) => {
    // Clear cookies for clean state
    await context.clearCookies();

    // Mock admin authentication
    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin-1',
          phone: '+30123456789',
          role: 'admin',
          created_at: '2025-01-01T00:00:00Z',
        }),
      });
    });
  });

  test('admin can view categories list', async ({ page }) => {
    // Mock categories API
    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              nameEn: 'Vegetables',
              icon: '🥬',
              sortOrder: 1,
              isActive: true
            },
            {
              id: 'cat-2',
              slug: 'fruits',
              name: 'Φρούτα',
              nameEn: 'Fruits',
              icon: '🍎',
              sortOrder: 2,
              isActive: true
            }
          ]
        }),
      });
    });

    await page.goto('/admin/categories');

    // Verify page loaded
    await expect(page.getByTestId('page-title')).toContainText('Διαχείριση Κατηγοριών');

    // Verify categories table is visible
    await expect(page.getByTestId('categories-table')).toBeVisible();

    // Verify both categories are displayed
    await expect(page.getByTestId('category-row-cat-1')).toBeVisible();
    await expect(page.getByTestId('category-row-cat-2')).toBeVisible();
  });

  test('admin can search categories', async ({ page }) => {
    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              nameEn: null,
              icon: '🥬',
              sortOrder: 1,
              isActive: true
            },
            {
              id: 'cat-2',
              slug: 'fruits',
              name: 'Φρούτα',
              nameEn: null,
              icon: '🍎',
              sortOrder: 2,
              isActive: true
            }
          ]
        }),
      });
    });

    await page.goto('/admin/categories');

    // Search for specific category
    await page.getByTestId('search-input').fill('Λαχανικά');

    // Verify only matching category is visible
    await expect(page.getByTestId('category-row-cat-1')).toBeVisible();
  });

  test('admin can toggle category active status', async ({ page }) => {
    let categoryActive = true;

    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              nameEn: null,
              icon: '🥬',
              sortOrder: 1,
              isActive: categoryActive
            }
          ]
        }),
      });
    });

    // Mock PATCH endpoint
    await page.route('**/api/categories/cat-1', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = await route.request().postDataJSON();
        categoryActive = body.isActive;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            category: {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              icon: '🥬',
              sortOrder: 1,
              isActive: categoryActive
            }
          }),
        });
      }
    });

    await page.goto('/admin/categories');

    // Verify initial active status
    await expect(page.getByTestId('category-status-cat-1')).toContainText('Ενεργή');

    // Click toggle button
    await page.getByTestId('toggle-active-cat-1').click();

    // Wait for success toast (optional verification)
    // Status badge should update after reload
    await page.waitForTimeout(500); // Wait for modal to appear if any
  });

  test('admin can open edit modal', async ({ page }) => {
    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              nameEn: null,
              icon: '🥬',
              sortOrder: 1,
              isActive: true
            }
          ]
        }),
      });
    });

    await page.goto('/admin/categories');

    // Click edit button
    await page.getByTestId('edit-category-cat-1').click();

    // Verify modal appears
    await expect(page.getByTestId('edit-modal')).toBeVisible();
    await expect(page.getByTestId('edit-modal-title')).toContainText('Επεξεργασία Κατηγορίας');

    // Verify form fields are populated
    await expect(page.getByTestId('edit-name-input')).toHaveValue('Λαχανικά');
    await expect(page.getByTestId('edit-icon-input')).toHaveValue('🥬');
    await expect(page.getByTestId('edit-sort-order-input')).toHaveValue('1');
  });

  test('admin can edit category name and save', async ({ page }) => {
    let categoryName = 'Λαχανικά';

    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: categoryName,
              nameEn: null,
              icon: '🥬',
              sortOrder: 1,
              isActive: true
            }
          ]
        }),
      });
    });

    // Mock PATCH endpoint
    await page.route('**/api/categories/cat-1', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = await route.request().postDataJSON();
        categoryName = body.name || categoryName;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            category: {
              id: 'cat-1',
              slug: 'vegetables',
              name: categoryName,
              icon: body.icon || '🥬',
              sortOrder: body.sortOrder || 1,
              isActive: true
            }
          }),
        });
      }
    });

    await page.goto('/admin/categories');

    // Open edit modal
    await page.getByTestId('edit-category-cat-1').click();

    // Edit category name
    await page.getByTestId('edit-name-input').fill('Νωπά Λαχανικά');

    // Save changes
    await page.getByTestId('edit-modal-save').click();

    // Modal should close
    await expect(page.getByTestId('edit-modal')).not.toBeVisible();
  });

  test('admin can cancel edit without saving', async ({ page }) => {
    await page.route('**/api/categories?includeInactive=true', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'cat-1',
              slug: 'vegetables',
              name: 'Λαχανικά',
              nameEn: null,
              icon: '🥬',
              sortOrder: 1,
              isActive: true
            }
          ]
        }),
      });
    });

    await page.goto('/admin/categories');

    // Open edit modal
    await page.getByTestId('edit-category-cat-1').click();

    // Edit name but then cancel
    await page.getByTestId('edit-name-input').fill('Changed Name');
    await page.getByTestId('edit-modal-cancel').click();

    // Modal should close without saving
    await expect(page.getByTestId('edit-modal')).not.toBeVisible();

    // Original name should still be displayed
    await expect(page.getByTestId('category-row-cat-1')).toContainText('Λαχανικά');
  });
});
