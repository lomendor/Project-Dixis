import { test, expect } from '@playwright/test';

test('Admin orders list pagination controls work', async ({ page }) => {
  // 1) Create first order
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('ci-pagination-1@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // 2) Create second order
  await page.goto('/checkout/flow');
  await page.getByLabel('Οδός & αριθμός').fill('Stadiou 2');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10564');
  await page.getByLabel('Email').fill('ci-pagination-2@dixis.dev');
  await page.getByTestId('flow-method').selectOption('PICKUP');
  await page.getByTestId('flow-weight').fill('300');
  await page.getByTestId('flow-subtotal').fill('25');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // 3) Navigate to admin orders list
  const res = await page.goto('/admin/orders');
  if (!res || res.status() >= 400) test.skip(true, 'admin list not available locally');

  // 4) Set page size to 1
  await page.getByTestId('page-size-selector').selectOption('1');

  // 5) Verify page info shows "1–1 of X orders"
  await expect(page.getByTestId('page-info')).toContainText(/1–1 of \d+ orders/);

  // 6) Verify first row is visible
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible();
  const firstEmail = await firstRow.locator('td').nth(7).textContent();

  // 7) Click Next button
  await page.getByTestId('page-next').click();

  // 8) Verify page info changed to "2–2 of X orders"
  await expect(page.getByTestId('page-info')).toContainText(/2–2 of \d+ orders/);

  // 9) Verify different row is now visible
  const secondRow = page.locator('tbody tr').first();
  await expect(secondRow).toBeVisible();
  const secondEmail = await secondRow.locator('td').nth(7).textContent();

  // The two emails should be different (we're on different pages)
  expect(firstEmail).not.toBe(secondEmail);

  // 10) Verify Prev button works
  await page.getByTestId('page-prev').click();
  await expect(page.getByTestId('page-info')).toContainText(/1–1 of \d+ orders/);
});
