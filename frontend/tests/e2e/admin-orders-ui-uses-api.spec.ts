import { test, expect } from '@playwright/test';

test('Admin Orders (UI): uses API when ?useApi=1 (demo-gated)', async ({ page }) => {
  await page.goto('/admin/orders?statusFilterDemo=1&useApi=1');
  // αρχικά εμφανίζεται λίστα
  await expect(page.getByTestId('results-count')).toBeVisible();
  // βάλε φίλτρο "Πληρωμή"
  await page.getByText('Πληρωμή').click();
  await expect(page.getByTestId('clear-filter')).toBeVisible();
  await expect(page.getByTestId('row-paid').first()).toBeVisible();
  // καθάρισε
  await page.getByTestId('clear-filter').click();
  await expect(page.getByTestId('row-pending').first()).toBeVisible();
});
