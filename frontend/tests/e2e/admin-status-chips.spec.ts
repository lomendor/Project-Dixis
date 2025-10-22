import { test, expect } from '@playwright/test';

test('Admin orders shows status chips on ?statusDemo=1', async ({ page }) => {
  await page.goto('/admin/orders?statusDemo=1');
  await expect(page.getByTestId('status-pending')).toBeVisible();
  await expect(page.getByTestId('status-paid')).toBeVisible();
  await expect(page.getByTestId('status-shipped')).toBeVisible();
  await expect(page.getByTestId('status-cancelled')).toBeVisible();
  await expect(page.getByTestId('status-refunded')).toBeVisible();
});
