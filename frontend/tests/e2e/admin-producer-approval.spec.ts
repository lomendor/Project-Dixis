import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * E2E Tests - Admin Producer Approval Workflow
 * Tests the approve/reject functionality for producer management
 */

const mockProducers = [
  {
    id: 'prod-1',
    name: 'Αγρόκτημα Κρήτης',
    region: 'Κρήτη',
    category: 'Ελαιόλαδα',
    isActive: true,
    approvalStatus: 'pending',
    rejectionReason: null
  },
  {
    id: 'prod-2',
    name: 'Μελισσοκομία Ηπείρου',
    region: 'Ήπειρος',
    category: 'Μέλι',
    isActive: true,
    approvalStatus: 'approved',
    rejectionReason: null
  },
  {
    id: 'prod-3',
    name: 'Τυροκομικά Νάξου',
    region: 'Νάξος',
    category: 'Τυροκομικά',
    isActive: false,
    approvalStatus: 'rejected',
    rejectionReason: 'Ελλιπή δικαιολογητικά'
  }
];

async function setupAdminProducerMocks(page: Page) {
  // Mock admin authentication
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

  await page.route('**/api/v1/auth/profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 1,
      name: 'Admin User',
      email: 'admin@dixis.local',
      role: 'admin'
    })
  }));

  // Mock producers list
  await page.route('**/api/admin/producers*', route => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: mockProducers })
      });
    } else {
      route.continue();
    }
  });
}

test.describe('Admin Producer Approval', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    // Mock admin user authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'admin_mock_token');
      localStorage.setItem('user_role', 'admin');
    });

    await setupAdminProducerMocks(page);
  });

  test('shows list of producers with status badges', async ({ page }) => {
    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Verify producers are displayed
    await expect(page.getByText('Αγρόκτημα Κρήτης')).toBeVisible();
    await expect(page.getByText('Μελισσοκομία Ηπείρου')).toBeVisible();
    await expect(page.getByText('Τυροκομικά Νάξου')).toBeVisible();

    // Verify status badges
    await expect(page.getByTestId('producer-status-pending')).toBeVisible();
    await expect(page.getByTestId('producer-status-approved')).toBeVisible();
    await expect(page.getByTestId('producer-status-rejected')).toBeVisible();
  });

  test('approve button visible only for pending producers', async ({ page }) => {
    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Pending producer should have approve button
    await expect(page.getByTestId('approve-btn-prod-1')).toBeVisible();
    await expect(page.getByTestId('reject-btn-prod-1')).toBeVisible();

    // Approved producer should NOT have approve button
    await expect(page.getByTestId('approve-btn-prod-2')).not.toBeVisible();
    await expect(page.getByTestId('reject-btn-prod-2')).not.toBeVisible();

    // Rejected producer should NOT have approve button
    await expect(page.getByTestId('approve-btn-prod-3')).not.toBeVisible();
  });

  test('can approve a pending producer', async ({ page }) => {
    // Track approval state
    let producerApproved = false;

    await page.route('**/api/admin/producers/prod-1/approve', route => {
      producerApproved = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Return updated list after approval
    await page.route('**/api/admin/producers*', route => {
      if (route.request().method() === 'GET') {
        const updatedProducers = mockProducers.map(p =>
          p.id === 'prod-1' && producerApproved
            ? { ...p, approvalStatus: 'approved' }
            : p
        );
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: updatedProducers })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Click approve button
    await page.getByTestId('approve-btn-prod-1').click();

    // After approval, the approve button should disappear
    await expect(page.getByTestId('approve-btn-prod-1')).not.toBeVisible({ timeout: 5000 });
  });

  test('reject modal opens and requires reason', async ({ page }) => {
    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Click reject button
    await page.getByTestId('reject-btn-prod-1').click();

    // Modal should open
    await expect(page.getByTestId('rejection-modal')).toBeVisible();
    await expect(page.getByTestId('rejection-modal-title')).toContainText('Απόρριψη Παραγωγού');

    // Confirm button should be disabled (no reason entered)
    const confirmBtn = page.getByTestId('rejection-modal-confirm');
    await expect(confirmBtn).toBeDisabled();

    // Enter short reason (less than 5 chars)
    await page.getByTestId('rejection-reason-input').fill('Test');
    await expect(confirmBtn).toBeDisabled();

    // Enter valid reason (5+ chars)
    await page.getByTestId('rejection-reason-input').fill('Ελλιπή στοιχεία');
    await expect(confirmBtn).toBeEnabled();
  });

  test('can cancel rejection modal', async ({ page }) => {
    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Open rejection modal
    await page.getByTestId('reject-btn-prod-1').click();
    await expect(page.getByTestId('rejection-modal')).toBeVisible();

    // Cancel the modal
    await page.getByTestId('rejection-modal-cancel').click();

    // Modal should close
    await expect(page.getByTestId('rejection-modal')).not.toBeVisible();

    // Producer should still be pending
    await expect(page.getByTestId('approve-btn-prod-1')).toBeVisible();
  });

  test('can reject a producer with reason', async ({ page }) => {
    let producerRejected = false;
    let capturedReason = '';

    await page.route('**/api/admin/producers/prod-1/reject', async route => {
      const body = await route.request().postDataJSON();
      capturedReason = body.rejectionReason;
      producerRejected = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Return updated list after rejection
    await page.route('**/api/admin/producers*', route => {
      if (route.request().method() === 'GET') {
        const updatedProducers = mockProducers.map(p =>
          p.id === 'prod-1' && producerRejected
            ? { ...p, approvalStatus: 'rejected', rejectionReason: capturedReason }
            : p
        );
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: updatedProducers })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Click reject button
    await page.getByTestId('reject-btn-prod-1').click();
    await expect(page.getByTestId('rejection-modal')).toBeVisible();

    // Enter rejection reason
    await page.getByTestId('rejection-reason-input').fill('Ελλιπή δικαιολογητικά για πιστοποίηση');

    // Confirm rejection
    await page.getByTestId('rejection-modal-confirm').click();

    // Modal should close and buttons should disappear
    await expect(page.getByTestId('rejection-modal')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('reject-btn-prod-1')).not.toBeVisible({ timeout: 5000 });
  });

  test('rejected producer shows rejection reason', async ({ page }) => {
    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Verify rejection reason is visible for prod-3
    const row = page.getByTestId('producer-row-prod-3');
    await expect(row).toBeVisible();
    await expect(row.getByText(/Λόγος:/)).toBeVisible();
  });

  test('search filters producers by name', async ({ page }) => {
    await page.route('**/api/admin/producers*', route => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';

      const filtered = mockProducers.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase())
      );

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: filtered })
      });
    });

    await page.goto('/admin/producers', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Παραγωγοί' })).toBeVisible({ timeout: 10000 });

    // Enter search term
    await page.locator('input[name="q"]').fill('Κρήτης');
    await page.locator('button[type="submit"]').click();

    // Should only show matching producer
    await expect(page.getByText('Αγρόκτημα Κρήτης')).toBeVisible();
    await expect(page.getByText('Μελισσοκομία Ηπείρου')).not.toBeVisible();
  });
});
