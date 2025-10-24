import { test, expect } from '@playwright/test';

test('Facet chip: highlight active & clear filter chip', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  const firstChip = page.locator('[data-testid^="facet-chip-"]').first();
  await expect(firstChip).toBeVisible();

  // Apply filter
  await Promise.all([
    page.waitForURL(/[\?&]status=/),
    firstChip.click(),
  ]);

  // Active highlight on the clicked chip
  await expect(firstChip).toHaveAttribute('data-active', '1');
  await expect(page.getByTestId('facet-chip-clear')).toBeVisible();

  // Clear filter via "Καθαρισμός"
  await Promise.all([
    page.waitForURL((url) => !/[?&]status=/.test(url)),
    page.getByTestId('facet-chip-clear').click(),
  ]);
});
