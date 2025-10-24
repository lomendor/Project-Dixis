import { test, expect } from '@playwright/test';

test('Orders UI: facet chip sets status in URL and Back clears it', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  const firstChip = page.locator('[data-testid^="facet-chip-"]').first();
  await expect(firstChip).toBeVisible();

  // Apply via chip (SPA navigation)
  const before = page.url();
  await Promise.all([
    page.waitForURL(/[\?&]status=/),
    firstChip.click(),
  ]);
  const after = page.url();
  expect(after).not.toBe(before);
  await expect(page.locator('[data-active="1"]')).toHaveCount(1);

  // Browser Back should remove the filter & un-highlight
  await page.goBack();
  await expect(page).toHaveURL((url) => !/[?&]status=/.test(url));
  await expect(page.locator('[data-active="1"]')).toHaveCount(0);
});

test('Orders UI: search q persists in URL and refetches facets', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  await page.fill('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]', 'A-200');
  await page.getByRole('button', { name: 'Εφαρμογή' }).click();

  await expect(page).toHaveURL(/[\?&]q=A-200/);
  // facets re-render
  await expect(page.getByTestId('facet-totals')).toBeVisible();
});
