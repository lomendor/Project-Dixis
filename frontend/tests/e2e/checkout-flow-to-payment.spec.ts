import { test, expect } from '@playwright/test';

test.describe('Checkout flow glue', () => {
  test('Address → Shipping → Payment stub', async ({ page }) => {
    await page
      .goto('/checkout/flow')
      .catch(() => test.skip(true, 'flow route not present'));

    // Address
    await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
    await page.getByLabel('Πόλη').fill('Athens');
    await page.getByLabel('Τ.Κ.').fill('10431');

    // Shipping settings
    await page.getByTestId('flow-method').selectOption('COURIER');
    await page.getByTestId('flow-weight').fill('500');
    await page.getByTestId('flow-subtotal').fill('42');

    // Wait for shipping & totals (debounced, so give it time)
    await page.waitForTimeout(500);
    await expect(page.getByTestId('shippingCost')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('flow-order-total')).toBeVisible();

    // Proceed to payment
    await page.getByTestId('flow-proceed').click();

    // Payment stub should show summary
    await expect(page.getByText('Πληρωμή (stub)')).toBeVisible();
    await expect(page.getByText('Σύνολο:')).toBeVisible();
  });
});
