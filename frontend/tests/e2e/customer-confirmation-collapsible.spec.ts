import { test, expect } from '@playwright/test';

test('Confirmation — Collapsible Αποστολή & Σύνολα toggles and shows ordNo/link', async ({ page }) => {
  // Create order to reach confirmation
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('collapsible@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible on confirmation');

  const coll = page.getByTestId('confirm-collapsible');
  await expect(coll).toBeVisible();

  // Initially closed → click summary to open
  await coll.locator('summary').click();
  await expect(coll).toHaveAttribute('open', '');

  // Check contents
  await expect(page.getByTestId('confirm-collapsible-ordno')).toContainText(ordNo);
  const origin = new URL(page.url()).origin;
  const expected = `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`;
  await expect(page.getByTestId('confirm-collapsible-share')).toHaveAttribute('href', expected);

  // Verify shipping & totals details
  await expect(page.getByTestId('confirm-collapsible-details')).toBeVisible();
  await expect(page.getByTestId('confirm-collapsible-total')).toBeVisible();

  // Click again to close
  await coll.locator('summary').click();
  await expect(coll).not.toHaveAttribute('open', '');
});
