import { test, expect } from '@playwright/test';

test('Orders UI: quick totals per page render and match rows count', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  // εμφανίζεται μετρητής συνόλου και τα chips ανά status
  await expect(page.getByTestId('quick-totals')).toBeVisible();

  // πάρε το "Σύνολο" από το component και μέτρα και τα rows
  const totalText = await page.getByTestId('total-all').textContent();
  const total = Number(String(totalText).match(/(\d+)/)?.[1] || '0');

  // μετράμε τα rows του table
  const rows = page.locator('[role="row"][data-testid^="row-"]');
  await expect(rows).toHaveCount(total);
});

test('Orders UI: quick totals hide when empty results', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await page.fill('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]', 'ZZZ-NOT-FOUND');
  await page.getByRole('button', { name: 'Εφαρμογή' }).click();
  // 0 αποτελέσματα => δεν εμφανίζονται totals
  await expect(page.getByTestId('quick-totals')).toHaveCount(0);
});
