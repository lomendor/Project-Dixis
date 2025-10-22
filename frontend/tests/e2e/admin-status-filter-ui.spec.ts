import { test, expect } from '@playwright/test';

test('Admin Orders: results count and clear filter', async ({ page }) => {
  await page.goto('/admin/orders?statusFilterDemo=1');
  // αρχικός μετρητής > 0
  const count = page.getByTestId('results-count');
  await expect(count).toBeVisible();

  // Ενεργοποίησε φίλτρο "Πληρωμή" → εμφανίζεται clear και count αλλάζει
  await page.getByTestId('chip-paid').click();
  await expect(page.getByTestId('clear-filter')).toBeVisible();
  await expect(page.getByTestId('row-paid').first()).toBeVisible();

  // Καθαρισμός → εμφανίζονται πάλι και άλλες καταστάσεις
  await page.getByTestId('clear-filter').click();
  await expect(page.getByTestId('row-pending').first()).toBeVisible();
});
