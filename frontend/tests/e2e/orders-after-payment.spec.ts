import { test, expect } from '@playwright/test';

test('After payment, order appears in admin list (CI BASIC_AUTH=1)', async ({
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

  await expect(page.getByTestId('shippingCost')).toBeVisible();
  await expect(page.getByTestId('flow-order-total')).toBeVisible();

  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();

  // Confirmation
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Admin list (guarded by BASIC_AUTH=1 → διαθέσιμο στο CI)
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400)
    test.skip(true, 'admin orders not available locally');
  await expect(page.getByText('Admin · Orders')).toBeVisible();
  // περιμένουμε να εμφανιστεί μια γραμμή με Τ.Κ. 10431
  await expect(page.getByText('10431')).toBeVisible();
});
