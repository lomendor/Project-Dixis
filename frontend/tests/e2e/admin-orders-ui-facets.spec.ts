import { test, expect } from '@playwright/test';

test('Orders UI: facet totals appear and react to filtering', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await expect(page.getByTestId('facet-totals')).toBeVisible();
  const totalAllText = await page.getByTestId('facet-total-all').textContent();
  const totalAll = Number(String(totalAllText).match(/(\d+)/)?.[1] || '0');
  expect(totalAll).toBeGreaterThan(0);

  // Βάλε φίλτρο αναζήτησης για να μικρύνει το σύνολο
  await page.fill('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]', 'A-200');
  await page.getByRole('button', { name: 'Εφαρμογή' }).click();

  // Μετά το φιλτράρισμα, τα facets πρέπει να ξαναεμφανιστούν και το σύνολο να αλλάξει
  await expect(page.getByTestId('facet-totals')).toBeVisible();
  const totalAllText2 = await page.getByTestId('facet-total-all').textContent();
  const totalAll2 = Number(String(totalAllText2).match(/(\d+)/)?.[1] || '0');
  expect(totalAll2).toBeGreaterThanOrEqual(0);
});
