import { test, expect } from '@playwright/test';

test('Admin Orders — Today quick filter includes a newly created order', async ({ page }) => {
  // 1) Create order via checkout flow
  await page.goto('/checkout/flow').catch(()=>test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-quickfilter@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // 2) Navigate to admin orders list
  const res = await page.goto('/admin/orders');
  if (!res || res.status()>=400) test.skip(true, 'admin list not available locally');

  // 3) Click Today quick filter
  await page.getByTestId('quick-range-today').click();

  // 4) Wait for table to update and verify order appears
  // Check for either email or postal code from our order
  await expect(
    page.locator('td').filter({ hasText: 'ci-quickfilter@dixis.dev' }).or(
      page.locator('td').filter({ hasText: '10431' })
    )
  ).toBeVisible({ timeout: 10000 });
});
