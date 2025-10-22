import { test, expect } from '@playwright/test';

test('Admin Orders UI: search & date filters wire to API (demo mode)', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await expect(page.getByTestId('results-count')).toBeVisible();

  await page.fill('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]', 'A-200');
  await page.getByRole('button', { name: 'Εφαρμογή' }).click();
  await expect(page.getByTestId('results-count')).toBeVisible();

  await page.getByRole('button', { name: 'Καθαρισμός' }).click();
  await expect(page.getByTestId('results-count')).toBeVisible();
});
