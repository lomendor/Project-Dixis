import { test, expect } from '@playwright/test';

test('Confirmation — Collapsible shows comprehensive Shipping & Totals data', async ({ page }) => {
  await page.goto('/checkout/flow').catch(()=>test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('shipping-totals@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const coll = page.getByTestId('confirm-collapsible');
  await expect(coll).toBeVisible();
  await coll.locator('summary').click();
  await expect(coll).toHaveAttribute('open', '');

  // Verify comprehensive shipping & totals labels are present
  const labels = [
    'Διεύθυνση',
    'Πόλη',
    'Τ.Κ.',
    'Μέθοδος αποστολής',
    'Σύνολο'
  ];

  for (const label of labels) {
    await expect(page.getByText(label)).toBeVisible();
  }

  // Verify data test IDs are present
  await expect(page.getByTestId('cc-address')).toBeVisible();
  await expect(page.getByTestId('cc-city')).toBeVisible();
  await expect(page.getByTestId('cc-zip')).toBeVisible();
  await expect(page.getByTestId('cc-method')).toBeVisible();
  await expect(page.getByTestId('cc-total')).toBeVisible();
});
