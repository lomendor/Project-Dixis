import { test, expect } from '@playwright/test';

test('Orders UI: debounced search updates URL after short idle (replace)', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  const input = page.locator('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]');
  await expect(input).toBeVisible();

  // Πληκτρολόγησε γρήγορα χωρίς pause
  await input.fill('');
  await input.type('A-200', { delay: 20 });

  // Περίμενε debounce
  await page.waitForTimeout(450);

  await expect(page).toHaveURL(/[\?&]q=A-200/);

  // Facets εμφανίζονται κανονικά
  await expect(page.getByTestId('facet-totals')).toBeVisible();
});
