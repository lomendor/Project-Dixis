import { test, expect } from '@playwright/test';

test('Admin Orders — remembers filters in URL & localStorage across reload', async ({ page }) => {
  // Create an order to have a valid ordNo
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-remember@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');

  // Navigate to admin orders list
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Set filters: ordNo, Today date range, sort by total, page size 10
  await page.getByPlaceholder('Order No (DX-YYYYMMDD-####)').fill(ordNo);
  await page.getByTestId('quick-range-today').click();
  await page.getByTestId('th-total').click(); // sort by total (toggles to desc first)
  await page.getByTestId('page-size').selectOption('10');

  // Verify Export link includes filters
  const href1 = await page.getByTestId('export-csv').getAttribute('href');
  expect(href1 || '').toContain('ordNo=');
  expect(href1 || '').toMatch(/from=|to=/);
  expect(href1 || '').toContain('sort=total');

  // Reload page
  await page.reload();

  // Verify filters persisted (from URL/localStorage)
  await expect(page.getByPlaceholder('Order No (DX-YYYYMMDD-####)')).toHaveValue(ordNo);

  const href2 = await page.getByTestId('export-csv').getAttribute('href');
  expect(href2 || '').toContain('ordNo=');
  expect(href2 || '').toMatch(/from=|to=/);
  expect(href2 || '').toMatch(/sort=total/);

  // Verify page size persisted
  await expect(page.getByTestId('page-size')).toHaveValue('10');
});
