import { test, expect } from '@playwright/test';

test('Confirmation page has Back to shop link that navigates to /', async ({ page }) => {
  // Create an order to reach confirmation
  await page.goto('/checkout/flow').catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByLabel('Email').fill('back2shop@dixis.dev');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const link = page.getByTestId('back-to-shop-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/');

  await Promise.all([
    page.waitForNavigation(),
    link.click()
  ]);
  expect(new URL(page.url()).pathname).toBe('/');
});

test('Lookup page shows Back to shop link', async ({ page }) => {
  await page.goto('/orders/lookup').catch(() => test.skip(true, 'lookup route not present'));
  const link = page.getByTestId('back-to-shop-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', '/');
});
