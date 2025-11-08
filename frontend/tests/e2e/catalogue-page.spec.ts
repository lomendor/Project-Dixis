import { test, expect } from '@playwright/test';

/**
 * Catalogue page E2E test
 * Validates that /products page renders correctly with data from /api/products
 */
test('GET /products page shows catalogue UI', async ({ page }) => {
  await page.goto('/products');

  // Check main heading is visible
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible();

  // Check description is visible
  await expect(page.getByText('Κατάλογος τοπικών προϊόντων')).toBeVisible();

  // Check either products are displayed OR empty state is shown
  const hasProducts = await page.locator('article').first().isVisible().catch(() => false);
  const hasEmptyState = await page.getByText('Δεν υπάρχουν προϊόντα').isVisible().catch(() => false);

  expect(hasProducts || hasEmptyState).toBe(true);
});
