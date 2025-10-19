import { test, expect } from '@playwright/test';

test('Admin Orders — column visibility toggle persists across reload', async ({ page }) => {
  // Create at least one order
  await page.goto('/checkout/flow').catch(()=>test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('colvis@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const res = await page.goto('/admin/orders');
  if (!res || res.status()>=400) test.skip(true, 'admin list not available locally');

  // Ensure toolbar appears
  await expect(page.getByTestId('columns-toolbar')).toBeVisible();

  // Uncheck first column (index 0)
  const cb0 = page.getByTestId('col-toggle-0');
  await expect(cb0).toBeChecked();
  await cb0.uncheck();

  // First header & first cell should be hidden
  await expect(page.locator('thead th').first()).toBeHidden();
  await expect(page.locator('tbody tr').first().locator('td').first()).toBeHidden();

  // Reload → should persist hidden
  await page.reload();
  await expect(page.getByTestId('columns-toolbar')).toBeVisible();
  await expect(page.getByTestId('col-toggle-0')).not.toBeChecked();
  await expect(page.locator('thead th').first()).toBeHidden();

  // Re-enable to leave page in sane state
  await page.getByTestId('col-toggle-0').check();
  await expect(page.locator('thead th').first()).toBeVisible();
});
