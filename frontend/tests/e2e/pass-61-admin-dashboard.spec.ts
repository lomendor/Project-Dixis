import { test, expect } from '@playwright/test';

/**
 * Pass 61: Admin Dashboard Polish
 *
 * Tests verify:
 * - Admin orders page loads with core UI elements
 * - Filters UI is present
 * - Pagination controls exist
 * - Quick stats display properly
 *
 * Note: Tests run in demo mode (no auth required) to avoid CI complexity.
 */

test.describe('Pass 61: Admin Dashboard Polish', () => {
  test('admin orders page loads with core UI elements', async ({ page }) => {
    await page.goto('/admin/orders');

    // Verify page loads with heading
    await expect(page.getByRole('heading', { name: /παραγγελίες/i })).toBeVisible({ timeout: 15000 });

    // Verify table header is visible (using role to target header row)
    const headerRow = page.getByRole('row').first();
    await expect(headerRow.getByText('Order')).toBeVisible();
    await expect(headerRow.getByText('Πελάτης')).toBeVisible();
    await expect(headerRow.getByText('Σύνολο')).toBeVisible();
    await expect(headerRow.getByText('Κατάσταση')).toBeVisible();
  });

  test('filter controls are present', async ({ page }) => {
    await page.goto('/admin/orders');

    // Wait for page load
    await expect(page.getByRole('heading', { name: /παραγγελίες/i })).toBeVisible({ timeout: 15000 });

    // Verify status filter chips exist (use testid to avoid matching status badges)
    await expect(page.getByTestId('chip-pending')).toBeVisible();
    await expect(page.getByTestId('chip-paid')).toBeVisible();
    await expect(page.getByTestId('chip-shipped')).toBeVisible();

    // Verify search input exists
    await expect(page.getByPlaceholder(/αναζήτηση/i)).toBeVisible();

    // Verify date filters exist
    await expect(page.getByText('Από:')).toBeVisible();
    await expect(page.getByText('Έως:')).toBeVisible();

    // Verify apply/clear buttons exist
    await expect(page.getByRole('button', { name: 'Εφαρμογή' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Καθαρισμός' })).toBeVisible();
  });

  test('pagination controls exist', async ({ page }) => {
    await page.goto('/admin/orders');

    // Wait for page load
    await expect(page.getByRole('heading', { name: /παραγγελίες/i })).toBeVisible({ timeout: 15000 });

    // Verify pagination info shows (contains "Σύνολο:" and "Σελίδα")
    await expect(page.getByText(/Σύνολο:.*Σελίδα/)).toBeVisible();

    // Verify next/prev buttons exist
    await expect(page.getByRole('button', { name: /επόμ/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /προηγ/i })).toBeVisible();

    // Verify page size selector exists (combobox with label "Page size:")
    await expect(page.getByRole('combobox', { name: /page size/i })).toBeVisible();
  });

  test('quick stats totals are displayed', async ({ page }) => {
    await page.goto('/admin/orders');

    // Wait for page load
    await expect(page.getByRole('heading', { name: /παραγγελίες/i })).toBeVisible({ timeout: 15000 });

    // Verify quick totals section shows status counts (pending, paid, shipped, etc.)
    // The page shows status breakdown like: pending 2, cancelled 1, paid 1, etc.
    await expect(page.getByText('pending')).toBeVisible({ timeout: 10000 });

    // Verify total count is shown (e.g., "Σύνολο: 6")
    await expect(page.locator('text=Σύνολο:').last()).toBeVisible();
  });
});
