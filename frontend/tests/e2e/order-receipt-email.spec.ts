import { test, expect } from '@playwright/test';

test('Order receipt email is stored in dev mailbox', async ({ page, request }) => {
  // 1) Κάνε το checkout flow
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
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

  // 2) Ζήτησε τη dev mailbox (διαθέσιμη στο CI όταν SMTP_DEV_MAILBOX=1)
  const res = await request.get('/api/dev/mailbox', { failOnStatusCode: false });
  if (!res.ok()) test.skip(true, 'dev mailbox API not available in this env');

  const list = await res.json();
  expect(Array.isArray(list)).toBeTruthy();

  // 3) Βρες email για τον default παραλήπτη
  const to = 'test@dixis.dev';
  const found = list.find((m: any) =>
    (m?.to || '').toLowerCase().includes(to) &&
    String(m?.subject || '').toLowerCase().includes('dixis order')
  );

  expect(found, 'receipt email should exist in dev mailbox').toBeTruthy();
});
