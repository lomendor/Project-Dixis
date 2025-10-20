import { test, expect } from '@playwright/test';

test('Admin Orders — Column presets (All/Minimal/Finance) apply and persist', async ({ page }) => {
  await page.goto('/admin/orders');

  // Wait for table to load
  await page.waitForSelector('[data-testid="orders-scroll"] table', { timeout: 10000 });

  // Wait for columns toolbar and presets to be created by AG45/AG47 effects
  await page.waitForSelector('[data-testid="columns-toolbar"]', { timeout: 5000 });
  await page.waitForSelector('[data-testid="columns-presets"]', { timeout: 5000 });

  // Verify presets buttons exist
  await expect(page.getByTestId('preset-all')).toBeVisible();
  await expect(page.getByTestId('preset-minimal')).toBeVisible();
  await expect(page.getByTestId('preset-finance')).toBeVisible();

  // Test: All preset → show all columns
  await page.getByTestId('preset-all').click();
  await page.waitForTimeout(300); // Allow DOM to update

  const countAll = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    return ths.filter(th => (th as HTMLElement).style.display !== 'none').length;
  });
  expect(countAll).toBeGreaterThan(0); // At least some columns visible

  // Test: Minimal preset → ≤3 visible columns
  await page.getByTestId('preset-minimal').click();
  await page.waitForTimeout(300); // Allow DOM to update

  const countMin = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    return ths.filter(th => (th as HTMLElement).style.display !== 'none').length;
  });
  expect(countMin).toBeLessThanOrEqual(Math.min(3, countAll));
  expect(countMin).toBeGreaterThan(0); // At least first column visible

  // Test: Persistence after reload
  await page.reload();
  await page.waitForSelector('[data-testid="orders-scroll"] table', { timeout: 10000 });
  await page.waitForSelector('[data-testid="columns-toolbar"]', { timeout: 5000 });

  const countMinReload = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    return ths.filter(th => (th as HTMLElement).style.display !== 'none').length;
  });
  expect(countMinReload).toBe(countMin); // Persisted via AG45 localStorage

  // Test: Finance preset → >=2 visible (first + finance fields)
  await page.getByTestId('preset-finance').click();
  await page.waitForTimeout(300); // Allow DOM to update

  const countFin = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    return ths.filter(th => (th as HTMLElement).style.display !== 'none').length;
  });
  expect(countFin).toBeGreaterThanOrEqual(2); // At least first column + one finance column

  // Verify finance columns are visible (Σύνολο should be visible)
  const totalColVisible = await page.evaluate(() => {
    const ths = Array.from(document.querySelectorAll('thead th'));
    const totalTh = ths.find(th => th.textContent?.includes('Σύνολο'));
    return totalTh ? (totalTh as HTMLElement).style.display !== 'none' : false;
  });
  expect(totalColVisible).toBe(true); // Total column should be visible with Finance preset
});
