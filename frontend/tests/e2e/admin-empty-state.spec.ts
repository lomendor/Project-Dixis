import { test, expect } from '@playwright/test';

test('Admin orders shows empty-state when ?empty=1', async ({ page }) => {
  await page.goto('/admin/orders?empty=1');
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
