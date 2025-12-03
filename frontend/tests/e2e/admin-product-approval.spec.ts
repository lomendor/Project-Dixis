import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Admin Product Approval
 * ADMIN-PRODUCT-1: Admin sees products with approval status
 * ADMIN-PRODUCT-2: Approve changes status from pending to approved
 * ADMIN-PRODUCT-3: Reject with reason works correctly
 */

const mockProducts = [
  { id: 'prod-1', title: 'Ντομάτες Κρήτης', price: 2.50, unit: 'kg', stock: 100, isActive: false, approvalStatus: 'pending', rejectionReason: null },
  { id: 'prod-2', title: 'Ελαιόλαδο', price: 12.00, unit: 'L', stock: 50, isActive: true, approvalStatus: 'approved', rejectionReason: null },
  { id: 'prod-3', title: 'Μέλι', price: 8.00, unit: 'kg', stock: 30, isActive: false, approvalStatus: 'rejected', rejectionReason: 'Ελλιπή στοιχεία' }
];

test.describe('Admin Product Approval', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock product list API
    await page.route('**/api/admin/products*', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: mockProducts })
        });
      } else {
        route.continue();
      }
    });
  });

  test('ADMIN-PRODUCT-1: shows products with approval status badges', async ({ page }) => {
    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });

    // Wait for products to load
    await expect(page.getByText('Ντομάτες Κρήτης')).toBeVisible({ timeout: 10000 });

    // Verify all status badges are visible
    await expect(page.getByTestId('product-status-pending')).toBeVisible();
    await expect(page.getByTestId('product-status-approved')).toBeVisible();
    await expect(page.getByTestId('product-status-rejected')).toBeVisible();

    // Verify approve/reject buttons only for pending
    await expect(page.getByTestId('approve-btn-prod-1')).toBeVisible();
    await expect(page.getByTestId('reject-btn-prod-1')).toBeVisible();
    await expect(page.getByTestId('approve-btn-prod-2')).not.toBeVisible();
  });

  test('ADMIN-PRODUCT-2: approve changes status from pending to approved', async ({ page }) => {
    let productApproved = false;

    await page.route('**/api/admin/products/prod-1/approve', route => {
      productApproved = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Το προϊόν εγκρίθηκε επιτυχώς' })
      });
    });

    await page.route('**/api/admin/products*', route => {
      if (route.request().method() === 'GET') {
        const updated = mockProducts.map(p =>
          p.id === 'prod-1' && productApproved
            ? { ...p, approvalStatus: 'approved', isActive: true }
            : p
        );
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: updated })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('approve-btn-prod-1')).toBeVisible({ timeout: 10000 });

    // Click approve
    await page.getByTestId('approve-btn-prod-1').click();

    // After approval, buttons should disappear
    await expect(page.getByTestId('approve-btn-prod-1')).not.toBeVisible({ timeout: 5000 });
  });

  test('ADMIN-PRODUCT-3: reject with reason works correctly', async ({ page }) => {
    let productRejected = false;
    let capturedReason = '';

    await page.route('**/api/admin/products/prod-1/reject', async route => {
      const body = await route.request().postDataJSON();
      capturedReason = body.rejectionReason;
      productRejected = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.route('**/api/admin/products*', route => {
      if (route.request().method() === 'GET') {
        const updated = mockProducts.map(p =>
          p.id === 'prod-1' && productRejected
            ? { ...p, approvalStatus: 'rejected', isActive: false, rejectionReason: capturedReason }
            : p
        );
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: updated })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('reject-btn-prod-1')).toBeVisible({ timeout: 10000 });

    // Open rejection modal
    await page.getByTestId('reject-btn-prod-1').click();
    await expect(page.getByTestId('rejection-modal')).toBeVisible();

    // Enter rejection reason
    await page.getByTestId('rejection-reason-input').fill('Ποιότητα εικόνας χαμηλή');

    // Confirm rejection
    await page.getByTestId('rejection-modal-confirm').click();

    // Modal closes and buttons disappear
    await expect(page.getByTestId('rejection-modal')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('reject-btn-prod-1')).not.toBeVisible({ timeout: 5000 });
  });
});
