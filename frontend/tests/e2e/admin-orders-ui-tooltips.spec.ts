import { test, expect } from '@playwright/test';

test('Orders UI: tooltips present on chips and search input', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');

  // Help badges υπάρχουν
  await expect(page.getByTestId('facet-chips-help')).toHaveAttribute('title', /Κάνε κλικ.*chip/i);
  await expect(page.getByTestId('search-help')).toHaveAttribute('title', /Debounced|300ms/i);

  // Ένα chip έχει title
  const chip = page.locator('[data-testid^="facet-chip-"]').first();
  await expect(chip).toHaveAttribute('title', /εναλλαγή/i);

  // Το input έχει title με οδηγίες
  const input = page.locator('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]');
  await expect(input).toHaveAttribute('title', /0\.3s|Enter/i);
});
