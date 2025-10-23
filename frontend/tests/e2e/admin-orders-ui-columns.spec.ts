import { test, expect } from '@playwright/test';

test('Admin Orders UI: column visibility persists', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await expect(page.getByTestId('results-count')).toBeVisible();

  // αρχικά φαίνεται "Πελάτης"
  await expect(page.locator('text=Πελάτης')).toBeVisible();

  // κρύψε "Πελάτης"
  await page.getByTestId('col-toggle-customer').uncheck();
  await expect(page.locator('text=Πελάτης')).toHaveCount(0);

  // refresh → παραμένει κρυμμένο (localStorage)
  await page.reload();
  await expect(page.locator('text=Πελάτης')).toHaveCount(0);

  // επανάφερε
  await page.getByTestId('col-toggle-customer').check();
  await expect(page.locator('text=Πελάτης')).toBeVisible();
});
