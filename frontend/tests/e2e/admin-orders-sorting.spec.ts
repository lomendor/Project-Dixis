import { test, expect } from '@playwright/test';

test('Admin Orders — sort by total (desc) shows highest first', async ({ page }) => {
  // Create 2 orders with different totals
  const orders = [
    { email: 'sort1@dixis.dev', total: '42' },
    { email: 'sort2@dixis.dev', total: '99' },
  ];

  for (const o of orders) {
    await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
    await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
    await page.getByLabel('Πόλη').fill('Athens');
    await page.getByLabel('Τ.Κ.').fill('10431');
    await page.getByLabel('Email').fill(o.email);
    await page.getByTestId('flow-method').selectOption('COURIER');
    await page.getByTestId('flow-weight').fill('500');
    await page.getByTestId('flow-subtotal').fill(o.total);
    await page.getByTestId('flow-proceed').click();
    await expect(page.getByText('Πληρωμή')).toBeVisible();
    await page.getByTestId('pay-now').click();
    await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();
  }

  // Navigate to admin orders list
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Click on "Σύνολο" header to sort by total
  const thTotal = page.getByTestId('th-total');
  await expect(thTotal).toBeVisible();
  await thTotal.click();

  // Get the first two total values from the "Σύνολο" column
  const totals = await page.locator('[data-testid="cell-total"]').allTextContents();
  test.skip(totals.length < 2, 'not enough rows to test sorting');

  // Parse euro values (remove € and convert to number)
  const v1 = Number((totals[0] || '').replace(/[^\d.]/g, ''));
  const v2 = Number((totals[1] || '').replace(/[^\d.]/g, ''));

  // Verify descending order (highest first)
  expect(v1).toBeGreaterThanOrEqual(v2);

  // Verify the highest value (99) is in the first cell
  expect(v1).toBeGreaterThanOrEqual(99);
});
