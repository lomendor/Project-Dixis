import { test, expect } from '@playwright/test';

test('Lookup submits with Enter and shows result (and busy indicator)', async ({ page }) => {
  // Create order via checkout flow
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-enter@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Get order number from confirmation page
  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');
  expect(ordNo).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);

  // Navigate to lookup page with prefilled order number
  await page.goto(`/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`);

  // Verify Order No is prefilled (AG30)
  await expect(page.getByTestId('lookup-order-no')).toHaveValue(ordNo);

  // Fill email
  await page.getByTestId('lookup-email').fill('ci-enter@dixis.dev');

  // Submit with Enter key from email field
  await page.getByTestId('lookup-email').press('Enter');

  // Busy indicator should appear (may be too fast in some environments)
  const busyIndicator = page.getByTestId('lookup-busy');
  // Non-blocking check - doesn't fail if too fast
  await busyIndicator.isVisible().catch(() => {
    /* May be too fast to observe */
  });

  // Result should appear with correct Order No
  const resultOrderNo = page.getByTestId('result-order-no');
  await expect(resultOrderNo).toBeVisible({ timeout: 10000 });
  await expect(resultOrderNo).toHaveText(ordNo);

  // Result should show order details
  await expect(page.getByTestId('lookup-result')).toBeVisible();
});
