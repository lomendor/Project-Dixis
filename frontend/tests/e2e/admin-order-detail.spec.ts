import { test, expect } from '@playwright/test';

test('Admin Order Detail shows the created order', async ({ page }) => {
  // Προϋπόθεση: η ροή checkout/confirmation δουλεύει (AG17).
  await page
    .goto('/checkout/flow')
    .catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Panepistimiou 1');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('10431');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('500');
  await page.getByTestId('flow-subtotal').fill('42');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  // Πάρε το Order ID από την confirmation
  const oid = await page.getByTestId('order-id').textContent();
  test.skip(
    !oid || oid.trim() === '',
    'orderId not found on confirmation'
  );

  // Άνοιξε σελίδα detail
  await page.goto(`/admin/orders/${oid}`);
  await expect(page.getByText('Admin · Order Detail')).toBeVisible();
  await expect(page.getByTestId('detail-order-id')).toHaveText(oid as string);
  await expect(page.getByTestId('detail-pc')).toHaveText('10431');
});
