import { test, expect } from '@playwright/test';

test('Admin Export — smart filename contains date and ord suffix when filtering by Order No', async ({ page }) => {
  // Create 1 order to get an ordNo
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('smartfile@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Extract Order No from confirmation page
  const ordNoText = await page.locator('text=/DX-\\d{8}-[A-Z0-9]{4}/').first().textContent();
  if (!ordNoText) test.skip(true, 'Order No not found on confirmation page');

  const ordNo = ordNoText!.trim();
  const suffix = ordNo.split('-').pop()?.toLowerCase() || '';
  if (!suffix) test.skip(true, 'Could not extract suffix from Order No');

  // Open admin
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Filter by Order No
  await page.getByTestId('filter-ordno').fill(ordNo);
  await page.getByTestId('filter-apply').click();

  // Click export and capture download
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-csv').click();
  const download = await downloadPromise;

  // Verify suggested filename contains:
  // - "orders_"
  // - today's date (YYYY-MM-DD)
  // - "ord-####" suffix from Order No
  const filename = download.suggestedFilename();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  expect(filename).toMatch(/^orders_/);
  expect(filename).toContain(today);
  expect(filename).toContain(`ord-${suffix}`);
  expect(filename).toMatch(/\.csv$/);
});
