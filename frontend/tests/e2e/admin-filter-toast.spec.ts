import { test, expect } from '@playwright/test';

test('Admin Orders — Filter chips show toast "Εφαρμόστηκε"', async ({ page }) => {
  await page.goto('/admin/orders');
  await page.waitForSelector('[data-testid="chips-toolbar"]', { timeout: 5000 });

  // Verify toast exists but is hidden
  const toast = page.getByTestId('chips-toast');
  await expect(toast).toHaveText('Εφαρμόστηκε');
  await expect(toast).toBeHidden();

  // Click a chip (e.g., PAID status chip)
  await page.getByTestId('chip-status-paid').click();

  // Toast should appear
  await expect(toast).toBeVisible();
  await expect(toast).toHaveText('Εφαρμόστηκε');

  // Wait for toast to auto-hide (1200ms + buffer)
  await page.waitForTimeout(1400);
  await expect(toast).toBeHidden();

  // Click another chip (e.g., COURIER method chip)
  await page.getByTestId('chip-method-courier').click();

  // Toast should reappear
  await expect(toast).toBeVisible();
  await expect(toast).toHaveText('Εφαρμόστηκε');

  // Wait for toast to auto-hide again
  await page.waitForTimeout(1400);
  await expect(toast).toBeHidden();
});
