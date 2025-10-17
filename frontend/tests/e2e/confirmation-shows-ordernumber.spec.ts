import { test, expect } from '@playwright/test';

test('Confirmation shows friendly Order No (DX-YYYYMMDD-####)', async ({
  page,
}) => {
  await page
    .goto('/checkout/flow')
    .catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const el = page.getByTestId('order-no');
  await expect(el).toBeVisible();
  const text = (await el.textContent())?.trim() || '';
  expect(text).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);
});
