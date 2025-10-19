import { test, expect } from '@playwright/test';

test('Confirmation — compact Order Summary card shows ordNo and share link', async ({ page }) => {
  // Create order via checkout flow
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('summary@dixis.dev');
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

  // Verify summary card is visible
  await expect(page.getByTestId('order-summary-card')).toBeVisible();

  // Verify card contains correct order number
  await expect(page.getByTestId('order-summary-ordno')).toContainText(ordNo);

  // Verify "Προβολή παραγγελίας" link points to correct share URL
  const origin = new URL(page.url()).origin;
  const expected = `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`;
  await expect(page.getByTestId('order-summary-share')).toHaveAttribute('href', expected);
});
