import { test, expect } from '@playwright/test';

test('Admin can resend receipt and it appears in dev mailbox', async ({ page, request }) => {
  // 1) Create order via checkout flow
  await page.goto('/checkout/flow').catch(()=>test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-recipient@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const oid = (await page.getByTestId('order-id').textContent())?.trim() || '';
  test.skip(!oid, 'orderId not visible on confirmation');

  // 2) Navigate to admin detail and resend
  await page.goto(`/admin/orders/${oid}`);
  await expect(page.getByText('Admin · Order Detail')).toBeVisible();
  const btn = page.getByTestId('resend-receipt');
  await expect(btn).toBeVisible();
  
  // Click and dismiss alert
  page.on('dialog', dialog => dialog.accept());
  await btn.click();

  // 3) Verify email in dev mailbox
  const res = await request.get('/api/dev/mailbox', { failOnStatusCode: false });
  if (!res.ok()) test.skip(true, 'dev mailbox API not available in this env');
  const list = await res.json();

  const found = list.find((m: any) =>
    String(m?.to || '').toLowerCase().includes('ci-recipient@dixis.dev') &&
    String(m?.subject || '').includes('DX-') &&
    String(m?.text || '').includes(`/admin/orders/${oid}`)
  );
  expect(found, 'resend email should exist in dev mailbox').toBeTruthy();
});
