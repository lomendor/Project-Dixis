import { test, expect } from '@playwright/test';

test('Status filter persists via ?status=… on reload and deep-link', async ({ page }) => {
  // Deep link: paid
  await page.goto('/admin/orders?statusFilterDemo=1&status=paid');
  await expect(page.getByTestId('row-paid').first()).toBeVisible();
  await expect(page.getByTestId('row-pending').first()).toBeHidden();

  // Change to shipped via chip; URL should update, reload should keep it
  await page.getByTestId('chip-shipped').click();
  await expect(page.getByTestId('row-shipped').first()).toBeVisible();
  // URL contains status=shipped
  await expect(page).toHaveURL(/status=shipped/);

  await page.reload();
  await expect(page.getByTestId('row-shipped').first()).toBeVisible();

  // Clear filter (Όλες) → URL param removed, rows back
  await page.getByTestId('chip-all').click();
  await expect(page.getByTestId('row-pending').first()).toBeVisible();
  await expect(page).not.toHaveURL(/status=/);
});
