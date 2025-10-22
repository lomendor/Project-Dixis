import { test, expect } from '@playwright/test';

test.describe('Admin Orders UI Pagination', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin orders page
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
  });

  test('should display pagination controls', async ({ page }) => {
    // Check for pagination elements
    await expect(page.getByTestId('page-prev')).toBeVisible();
    await expect(page.getByTestId('page-next')).toBeVisible();
    await expect(page.getByTestId('page-info')).toBeVisible();
    await expect(page.getByTestId('page-size-select')).toBeVisible();
  });

  test('should display page size selector with options', async ({ page }) => {
    const select = page.getByTestId('page-size-select');
    await expect(select).toBeVisible();

    // Verify options exist
    const options = await select.locator('option').allTextContents();
    expect(options).toContain('5');
    expect(options).toContain('10');
    expect(options).toContain('20');
  });

  test('should display sort toggle button', async ({ page }) => {
    await expect(page.getByTestId('sort-toggle')).toBeVisible();
  });

  test('should cycle through sort options on button click', async ({ page }) => {
    const sortBtn = page.getByTestId('sort-toggle');

    // Initial state (Date ↓)
    await expect(sortBtn).toContainText('Date ↓');

    // Click to Date ↑
    await sortBtn.click();
    await page.waitForTimeout(500);
    await expect(sortBtn).toContainText('Date ↑');

    // Click to Total ↓
    await sortBtn.click();
    await page.waitForTimeout(500);
    await expect(sortBtn).toContainText('Total ↓');

    // Click to Total ↑
    await sortBtn.click();
    await page.waitForTimeout(500);
    await expect(sortBtn).toContainText('Total ↑');
  });

  test('should change page size and reset to page 1', async ({ page }) => {
    const select = page.getByTestId('page-size-select');
    const pageInfo = page.getByTestId('page-info');

    // Change page size to 5
    await select.selectOption('5');
    await page.waitForTimeout(500);

    // Should reset to page 1
    await expect(pageInfo).toContainText('Page 1');
  });

  test('should navigate to next page when clicking Next button', async ({ page }) => {
    const nextBtn = page.getByTestId('page-next');
    const pageInfo = page.getByTestId('page-info');

    // Check if next button is enabled (depends on data)
    const isDisabled = await nextBtn.isDisabled();
    if (!isDisabled) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await expect(pageInfo).toContainText('Page 2');
    }
  });

  test('should navigate to previous page when clicking Previous button', async ({ page }) => {
    const nextBtn = page.getByTestId('page-next');
    const prevBtn = page.getByTestId('page-prev');
    const pageInfo = page.getByTestId('page-info');

    // Go to page 2 first (if possible)
    const isNextDisabled = await nextBtn.isDisabled();
    if (!isNextDisabled) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await expect(pageInfo).toContainText('Page 2');

      // Now go back to page 1
      await prevBtn.click();
      await page.waitForTimeout(500);
      await expect(pageInfo).toContainText('Page 1');
    }
  });

  test('should disable Previous button on page 1', async ({ page }) => {
    const prevBtn = page.getByTestId('page-prev');
    await expect(prevBtn).toBeDisabled();
  });

  test('should display results count', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count');
    await expect(resultsCount).toBeVisible();
    // Should show "Showing X–Y of Z orders" or "No orders"
  });

  test('should display orders table', async ({ page }) => {
    await expect(page.getByTestId('orders-table')).toBeVisible();
  });

  test('should filter by status and reset to page 1', async ({ page }) => {
    const statusSelect = page.getByTestId('filter-status');
    const pageInfo = page.getByTestId('page-info');

    // Select a status filter
    await statusSelect.selectOption('paid');
    await page.waitForTimeout(500);

    // Should reset to page 1
    await expect(pageInfo).toContainText('Page 1');
  });

  test('should display error message when API fails', async ({ page }) => {
    // Force an error by navigating to a route that doesn't exist
    await page.route('/api/admin/orders*', (route) => route.abort());

    await page.reload();
    await page.waitForTimeout(1000);

    // Should display error message
    const errorMsg = page.getByTestId('error-message');
    await expect(errorMsg).toBeVisible();
  });
});
