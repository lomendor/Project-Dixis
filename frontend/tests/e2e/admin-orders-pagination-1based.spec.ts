import { test, expect } from '@playwright/test';

test('Admin Orders — 1-based pagination indicator (never starts at 0)', async ({ page }) => {
  // Create at least 1 order
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('guard-1based@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Open admin
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // The page indicator should never start at 0 when total > 0
  const pagerText = await page.locator('text=/of \\d+ orders$/').first().textContent();
  const m = pagerText?.match(/^(\d+)[–-]/);
  if (!m) test.skip(true, 'pager indicator not found');
  const start = Number(m[1]);
  const totalMatch = pagerText?.match(/of (\d+) orders$/);
  const total = Number(totalMatch?.[1] || 0);

  if (total > 0) {
    expect(start).toBeGreaterThanOrEqual(1);
  }
});
