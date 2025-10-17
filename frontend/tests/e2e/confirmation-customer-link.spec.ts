import { test, expect } from '@playwright/test';

test('Confirmation page — customer link + copy button', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // 1) Create order via checkout flow
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('copy-test@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // 2) Verify customer link is visible
  const customerLink = page.getByTestId('customer-link');
  await expect(customerLink).toBeVisible();

  // 3) Get the order number from the page
  const orderNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  expect(orderNo).toMatch(/^DX-\d{8}-[A-Z0-9]{4}$/);

  // 4) Verify the customer link contains the order number
  const linkText = (await customerLink.textContent())?.trim() || '';
  expect(linkText).toContain(`/orders/lookup?ordNo=${orderNo}`);

  // 5) Click the copy button
  const copyButton = page.getByTestId('copy-customer-link');
  await expect(copyButton).toBeVisible();
  await copyButton.click();

  // 6) Verify "Copied!" message appears
  const copiedFlag = page.getByTestId('copied-flag');
  await expect(copiedFlag).toBeVisible();
  expect(await copiedFlag.textContent()).toContain('Copied!');

  // 7) Verify clipboard contains the customer link
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain(`/orders/lookup?ordNo=${orderNo}`);
  expect(clipboardText).toContain(orderNo);

  // 8) Wait for "Copied!" message to disappear (should take ~2s)
  await expect(copiedFlag).not.toBeVisible({ timeout: 3000 });
});
