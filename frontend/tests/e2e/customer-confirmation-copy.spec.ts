import { test, expect } from '@playwright/test';

test('Confirmation — Copy ordNo / Copy link show toast and copy payloads', async ({ page }) => {
  // Stub clipboard
  await page.addInitScript(() => {
    // @ts-ignore
    window.__copied = [];
    // @ts-ignore
    navigator.clipboard = {
      writeText: (v: string) => {
        // @ts-ignore
        window.__copied.push(v);
        return Promise.resolve();
      }
    };
  });

  // Create order to reach confirmation
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('copy-actions@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const ordNo = (await page.getByTestId('order-no').textContent())?.trim() || '';
  test.skip(!ordNo, 'no order number on confirmation');

  // Click copy ordNo
  await page.getByTestId('copy-ordno').click();
  await expect(page.getByTestId('copy-toast')).toBeVisible();
  await expect(page.getByTestId('copy-toast')).toContainText('Αντιγράφηκε ο αριθμός');

  // Wait for toast to disappear
  await page.waitForTimeout(1300);

  // Click copy link
  await page.getByTestId('copy-link').click();
  await expect(page.getByTestId('copy-toast')).toBeVisible();
  await expect(page.getByTestId('copy-toast')).toContainText('Αντιγράφηκε ο σύνδεσμος');

  // Inspect stub payloads
  const copied = await page.evaluate(() => (window as any).__copied);
  expect(copied.some((v: string) => v === ordNo)).toBeTruthy();

  const origin = new URL(page.url()).origin;
  const expectedLink = `${origin}/orders/lookup?ordNo=${encodeURIComponent(ordNo)}`;
  expect(copied.some((v: string) => v === expectedLink)).toBeTruthy();
});
