import { test, expect } from '@playwright/test';

test('Orders UI: empty state shown on zero results and clears filters', async ({ page }) => {
  // Δώσε query που δεν θα ταιριάζει
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5&q=__NO_MATCH__XYZ__');
  await expect(page.getByTestId('orders-empty-state')).toBeVisible();

  // Πάτα "Καθαρισμός φίλτρων" → καθαρίζει q/status & επανέρχονται τα αποτελέσματα
  await Promise.all([
    page.waitForURL((url)=>!/[?&]q=/.test(url)),  // q αφαιρέθηκε
    page.getByTestId('orders-empty-clear').click(),
  ]);

  // Βεβαιώσου ότι δεν υπάρχει πια empty state
  await expect(page.getByTestId('orders-empty-state')).toHaveCount(0);
});
