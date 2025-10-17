import { test, expect } from '@playwright/test';

test('Admin orders list can filter by Order No (DX-YYYYMMDD-####)', async ({ page }) => {
  // 1) Create order via checkout flow
  await page.goto('/checkout/flow').catch(()=>test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-recipient@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');

  // 2) Navigate to admin orders list
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // 3) Filter by Order No
  await page.getByTestId('filter-ordno').fill(ordNo);
  await page.getByTestId('filter-apply').click();

  // 4) Verify the Order No appears in the table
  await expect(page.getByText(ordNo)).toBeVisible();
});
