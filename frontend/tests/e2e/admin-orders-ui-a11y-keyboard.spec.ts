import { test, expect } from '@playwright/test';

test('Facet chip toggles with keyboard (Enter) & reflects in URL/highlight', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  const chip = page.locator('[data-testid^="facet-chip-"]').first();
  await expect(chip).toBeVisible();
  await chip.focus();
  await Promise.all([ page.waitForURL(/[\?&]status=/), page.keyboard.press('Enter') ]);
  await expect(chip).toHaveAttribute('data-active','1');
  await Promise.all([ page.waitForURL((u)=>!/[?&]status=/.test(u)), page.keyboard.press('Enter') ]);
  await expect(chip).toHaveAttribute('data-active','0');
});

test('Enter-to-search applies immediately via replace (no debounce wait)', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=2&pageSize=5'); // page=2 to verify reset→1
  const input = page.locator('input[placeholder="Αναζήτηση (Order ID ή Πελάτης)"]');
  await expect(input).toBeVisible();
  await input.fill('A-300');
  await Promise.all([
    page.waitForURL(/[\?&]q=A-300/),
    page.keyboard.press('Enter'),
  ]);
  // page reset to 1
  await expect(page).toHaveURL(/[\?&]page=1/);
});
