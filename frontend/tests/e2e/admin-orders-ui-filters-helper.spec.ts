import { test, expect } from '@playwright/test';

test('Orders UI: filters helper shows & clears all', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=2&pageSize=5&status=pending&q=A-200');
  const helper = page.getByTestId('filters-helper');
  await expect(helper).toBeVisible();
  await expect(helper).toContainText('Ενεργά φίλτρα:');
  await expect(helper).toContainText('Κατάσταση:');
  await expect(helper).toContainText('Αναζήτηση:');
  // Πατάμε καθαρισμό → αφαιρούνται φίλτρα & reset
  await Promise.all([
    page.waitForURL((u)=>!/[?&](status|q|fromDate|toDate)=/.test(u)),
    page.getByTestId('filters-clear-all').click(),
  ]);
  await expect(page.getByTestId('filters-helper')).toHaveCount(0);
});
