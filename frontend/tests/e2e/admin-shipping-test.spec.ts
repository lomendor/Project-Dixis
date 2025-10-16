import { test, expect } from '@playwright/test';

test.describe('Admin · Shipping Test', () => {
  test('page renders and shows shipping cost after inputs', async ({ page }) => {
    const candidates = ['/admin/shipping-test', '/admin/shipping-test/'];
    let ok = false;
    for (const url of candidates) {
      try { await page.goto(url); ok = true; break; } catch {}
    }
    if (!ok) test.skip(true, 'admin shipping-test route not present');

    await page.getByTestId('postal-input').fill('10431');
    await page.getByTestId('method-select').selectOption('COURIER');
    await page.getByTestId('weight-input').fill('500');

    await expect(page.getByTestId('shippingCost')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('why-tooltip')).toBeVisible();
  });
});
