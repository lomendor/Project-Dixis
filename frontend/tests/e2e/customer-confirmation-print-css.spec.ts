import { test, expect } from '@playwright/test';

test('Confirmation — @media print hides toolbar, keeps summary visible', async ({ page }) => {
  // Create order to reach confirmation page
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('print-css@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Normal state: toolbar visible
  const toolbar = page.getByTestId('print-toolbar');
  await expect(toolbar).toBeVisible();
  await expect(page.getByTestId('order-summary-card')).toBeVisible();

  // Emulate print → toolbar should hide, summary should remain
  await page.emulateMedia({ media: 'print' });
  await expect(toolbar).toBeHidden();
  await expect(page.getByTestId('order-summary-card')).toBeVisible();

  // Reset (proactively)
  await page.emulateMedia({ media: 'screen' });
});
