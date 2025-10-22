import { test, expect } from '@playwright/test';

test('Admin orders status filter via ?statusFilterDemo=1', async ({ page }) => {
  await page.goto('/admin/orders?statusFilterDemo=1');
  // αρχικά δείχνει πολλές γραμμές
  await expect(page.getByTestId('row-pending').first()).toBeVisible();

  // φίλτρο Πληρωμή
  await page.getByTestId('chip-paid').click();
  await expect(page.getByTestId('row-paid').first()).toBeVisible();
  // και δεν πρέπει να φαίνονται άλλες καταστάσεις
  await expect(page.getByTestId('row-pending').first()).toBeHidden();

  // καθάρισμα φίλτρου (Όλες)
  await page.getByTestId('chip-all').click();
  await expect(page.getByTestId('row-shipped').first()).toBeVisible();
});
