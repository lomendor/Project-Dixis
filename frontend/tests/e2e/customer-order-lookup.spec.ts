import { test, expect } from '@playwright/test';

test('Customer can lookup order by Order No + Email', async ({ page }) => {
  // 1) Complete checkout flow to create an order
  await page
    .goto('/checkout/flow')
    .catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  const email = 'lookup-test@dixis.dev';
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await expect(page.getByTestId('shippingCost')).toBeVisible();
  await expect(page.getByTestId('flow-order-total')).toBeVisible();
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // 2) Capture Order No from confirmation page
  const orderNoEl = page.getByTestId('order-no');
  await expect(orderNoEl).toBeVisible();
  const orderNo = ((await orderNoEl.textContent()) || '').trim();
  expect(orderNo).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);

  // 3) Navigate to /orders/lookup
  await page.goto('/orders/lookup');
  await expect(page.getByText('Αναζήτηση Παραγγελίας')).toBeVisible();

  // 4) Fill lookup form
  await page.getByTestId('lookup-order-no').fill(orderNo);
  await page.getByTestId('lookup-email').fill(email);

  // 5) Submit and verify result
  await page.getByTestId('lookup-submit').click();
  await expect(page.getByTestId('lookup-result')).toBeVisible();
  await expect(page.getByTestId('result-order-no')).toHaveText(orderNo);
  await expect(page.getByTestId('result-postal-code')).toHaveText('10431');
  await expect(page.getByTestId('result-method')).toHaveText('COURIER');
});
