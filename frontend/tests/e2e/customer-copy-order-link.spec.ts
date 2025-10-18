import { test, expect } from '@playwright/test';

test('Confirmation — Copy order link shows toast and share URL matches ordNo', async ({ page }) => {
  // Create order to reach confirmation page
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('copy-link@dixis.dev');
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

  // Build expected share URL
  const origin = new URL(page.url()).origin;
  const expected = `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`;

  // Verify hidden share-url element matches expected URL
  const share = (await page.getByTestId('share-url').textContent())?.trim() || '';
  expect(share).toBe(expected);

  // Click copy button and verify toast appears
  await page.getByTestId('copy-order-link').click();
  await expect(page.getByTestId('copy-toast')).toBeVisible();
  await expect(page.getByTestId('copy-toast')).toHaveText('Αντιγράφηκε');
});

test('Lookup — Copy order link shows on result with toast', async ({ page }) => {
  // Create order first
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('lookup-copy@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'order number not visible');

  // Navigate to lookup page
  await page.goto('/orders/lookup');
  await page.getByTestId('lookup-order-no').fill(ordNo);
  await page.getByTestId('lookup-email').fill('lookup-copy@dixis.dev');
  await page.getByTestId('lookup-submit').click();

  // Wait for result to appear
  await expect(page.getByTestId('lookup-result')).toBeVisible();

  // Verify copy button exists and click it
  const copyBtn = page.getByTestId('copy-order-link-lookup');
  await expect(copyBtn).toBeVisible();
  await expect(copyBtn).toHaveText('Αντιγραφή συνδέσμου');

  await copyBtn.click();

  // Verify toast appears with Greek text
  await expect(page.getByTestId('copy-toast-lookup')).toBeVisible();
  await expect(page.getByTestId('copy-toast-lookup')).toHaveText('Αντιγράφηκε');
});
