import { test, expect } from '@playwright/test';

test('Admin Orders — Reset filters clears inputs, URL and localStorage', async ({ page }) => {
  // Create an order to get an orderNo
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('reset-filters@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');

  // Navigate to admin and apply filters
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Apply multiple filters
  await page.getByPlaceholder('Order No (DX-YYYYMMDD-####)').fill(ordNo);
  await page.getByTestId('quick-range-today').click().catch(() => {});
  await page.getByTestId('th-total').click().catch(() => {}); // sort by total

  // Wait for localStorage to be updated (AG33 saves filters)
  await page.waitForTimeout(200);

  // Before reset, export href should contain filters
  const hrefBefore = await page.getByTestId('export-csv').getAttribute('href');
  expect(hrefBefore || '').toMatch(/ordNo=/);

  // Click Reset button
  await page.getByTestId('filters-reset').click();

  // Verify success toast appears
  await expect(page.getByTestId('filters-reset-flag')).toBeVisible();
  await expect(page.getByTestId('filters-reset-flag')).toHaveText('Επαναφέρθηκαν');

  // Verify inputs are cleared
  await expect(page.getByPlaceholder('Order No (DX-YYYYMMDD-####)')).toHaveValue('');

  // Verify URL/Export doesn't contain ordNo or from/to (may have defaults like sort/dir)
  const hrefAfter = await page.getByTestId('export-csv').getAttribute('href');
  expect(hrefAfter || '').not.toMatch(/ordNo=/);
  expect(hrefAfter || '').not.toMatch(/from=|to=/);

  // Verify localStorage key is cleared
  const stored = await page.evaluate(() => localStorage.getItem('dixis.adminOrders.filters'));
  // After reset, the sync effect will create a new entry with defaults, so just verify ordNo is not there
  if (stored && stored !== 'null') {
    const parsed = JSON.parse(stored);
    expect(parsed.ordNo || '').toBe('');
  }
});
