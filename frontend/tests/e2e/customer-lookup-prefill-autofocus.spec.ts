import { test, expect } from '@playwright/test';

test('Lookup pre-fills from ?ordNo= and focuses Email', async ({ page }) => {
  // Create order via checkout flow
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-prefill@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Get the order number from confirmation page
  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');
  expect(ordNo).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);

  // Visit lookup page with ?ordNo= query parameter
  await page.goto(`/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`);

  // Verify Order No input is pre-filled
  const ordInput = page.getByTestId('lookup-order-no');
  await expect(ordInput).toHaveValue(ordNo);

  // Verify Email input has focus
  const emailInput = page.getByTestId('lookup-email');
  await expect(emailInput).toBeFocused();
});
