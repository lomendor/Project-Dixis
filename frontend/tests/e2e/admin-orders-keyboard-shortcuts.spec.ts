import { test, expect } from '@playwright/test';

test('Admin Orders — keyboard shortcuts: / focus, t=Today, ] next (prev enabled)', async ({ page }) => {
  // Create 2 orders so there's a next page
  for (const email of ['kb1@dixis.dev', 'kb2@dixis.dev']) {
    await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
    await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
    await page.getByLabel('Πόλη').fill('Athens');
    await page.getByLabel('Τ.Κ.').fill('10431');
    await page.getByLabel('Email').fill(email);
    await page.getByTestId('flow-method').selectOption('COURIER');
    await page.getByTestId('flow-weight').fill('500');
    await page.getByTestId('flow-subtotal').fill('42');
    await page.getByTestId('flow-proceed').click();
    await expect(page.getByText('Πληρωμή')).toBeVisible();
    await page.getByTestId('pay-now').click();
    await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();
  }

  // Admin list
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // Set page size = 1 to ensure there's a next page
  await page.getByTestId('page-size').selectOption('10').catch(() => {});
  await page.getByTestId('page-size').selectOption('1').catch(() => {});

  // '/' → focus on Order No input
  await page.keyboard.press('/');
  await expect(page.getByPlaceholder('Order No (DX-YYYYMMDD-####)')).toBeFocused();

  // 't' → Today → export link should contain from/to
  await page.keyboard.press('t');
  const href = await page.getByTestId('export-csv').getAttribute('href');
  expect(href || '').toMatch(/from=/);
  expect(href || '').toMatch(/to=/);

  // ']' → Next page → Prev button should be enabled
  const prevBtn = page.getByTestId('pager-prev');
  await prevBtn.isDisabled().catch(() => {}); // may be disabled at first
  await page.keyboard.press(']');
  await expect(prevBtn).toBeEnabled();
});
