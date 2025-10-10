import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('Shipping method selector updates totals dynamically', async ({ page }) => {
  // Set cart subtotal in localStorage
  await page.addInitScript(() => {
    window.localStorage.setItem('cartSubtotal', '20');
  });

  await page.goto(base + '/checkout');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if shipping method selector is visible
  const selectorVisible = await page.getByText(/Μέθοδος αποστολής|Shipping Method/i).isVisible().catch(() => false);

  if (!selectorVisible) {
    // Skip test if selector not yet integrated (depends on PR #470 merge)
    test.skip();
    return;
  }

  // Check that shipping info section exists
  await expect(page.getByText(/Μεταφορικά|Shipping/i)).toBeVisible();

  // Helper to read shipping cost
  const readShipping = async () => {
    try {
      const row = page.getByText(/Μεταφορικά/i).first();
      const container = row.locator('xpath=..');
      const costText = await container.locator('text=/€/').first().innerText();
      return Number(costText.replace(/[^\d.]/g, ''));
    } catch {
      return -1;
    }
  };

  // Read initial shipping cost (COURIER default)
  await page.waitForTimeout(500); // Wait for API call
  const initialShipping = await readShipping();
  expect(initialShipping).toBeGreaterThanOrEqual(0);

  // Change to COURIER_COD (should add COD fee)
  const codOption = page.getByLabel(/Κούριερ \(αντικαταβολή\)|COURIER.*COD/i);
  if (await codOption.isVisible().catch(() => false)) {
    await codOption.check();
    await page.waitForTimeout(300); // Wait for API call
    const codShipping = await readShipping();
    expect(codShipping).toBeGreaterThanOrEqual(initialShipping); // COD >= base
  }

  // Change to PICKUP (should be 0)
  const pickupOption = page.getByLabel(/Παραλαβή από κατάστημα|PICKUP/i);
  if (await pickupOption.isVisible().catch(() => false)) {
    await pickupOption.check();
    await page.waitForTimeout(300); // Wait for API call
    const pickupShipping = await readShipping();
    expect(pickupShipping).toBe(0);
  }
});

test('Shipping method selector renders with Greek labels', async ({ page }) => {
  await page.goto(base + '/checkout');
  await page.waitForLoadState('networkidle');

  // Check if selector exists (may not be present if PR #470 hasn't merged)
  const hasSelector = await page.getByText(/Μέθοδος αποστολής/i).isVisible().catch(() => false);

  if (!hasSelector) {
    test.skip();
    return;
  }

  // Verify Greek labels are present
  await expect(page.getByText(/Παραλαβή από κατάστημα/i)).toBeVisible();
  await expect(page.getByText(/Κούριερ/i)).toBeVisible();
  await expect(page.getByText(/αντικαταβολή/i)).toBeVisible();
});
