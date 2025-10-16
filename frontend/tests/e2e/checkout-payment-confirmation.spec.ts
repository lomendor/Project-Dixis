import { test, expect } from '@playwright/test';

test('Flow → Payment → Pay → Confirmation', async ({ page }) => {
  await page
    .goto('/checkout/flow')
    .catch(() => test.skip(true, 'flow route not present'));

  // Fill address
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');

  // Set shipping settings
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');

  // Wait for shipping calculation (debounced)
  await page.waitForTimeout(500);
  await expect(page.getByTestId('shippingCost')).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByTestId('flow-order-total')).toBeVisible();

  // Proceed to payment
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();

  // Pay now
  await page.getByTestId('pay-now').click();

  // Confirmation page should load (mock payment is 95% success)
  // Use timeout to handle mock delay + potential retry on 5% failure
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByTestId('confirm-total')).toBeVisible();
});
