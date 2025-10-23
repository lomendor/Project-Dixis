import { test, expect } from '@playwright/test';

test('Orders UI: facet chip applies then clears status filter', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  // Πάρε κάποιο διαθέσιμο chip
  const firstChip = page.locator('[data-testid^="facet-chip-"]').first();
  await expect(firstChip).toBeVisible();

  // Εφάρμοσε φίλτρο με tap
  const before = page.url();
  await Promise.all([
    page.waitForURL(/[\?&]status=/),
    firstChip.click(),
  ]);
  const after = page.url();
  expect(after).not.toBe(before);
  expect(after).toMatch(/[\?&]status=/);

  // Tap ξανά στο ίδιο chip => καθάρισμα φίλτρου (δεν απαιτείται να είναι ίδιο το URL, αρκεί να φύγει το status)
  await Promise.all([
    page.waitForURL((url) => !/[?&]status=/.test(url)),
    firstChip.click(),
  ]);
});
