import { test, expect } from '@playwright/test';

test('Confirmation — Print/PDF CTA triggers window.print', async ({ page }) => {
  // Stub window.print before navigation
  await page.addInitScript(() => {
    // @ts-ignore
    window.__printed = 0;
    // @ts-ignore
    window.print = () => {
      // @ts-ignore
      window.__printed++;
    };
  });

  // Create order to reach confirmation page
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('print@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Verify print toolbar and button exist
  await expect(page.getByTestId('print-toolbar')).toBeVisible();
  await expect(page.getByTestId('print-pdf')).toBeVisible();

  // Click the Print/PDF button
  await page.getByTestId('print-pdf').click();

  // Verify window.print was called
  const printed = await page.evaluate(() => (window as any).__printed || 0);
  expect(printed).toBeGreaterThan(0);
});
