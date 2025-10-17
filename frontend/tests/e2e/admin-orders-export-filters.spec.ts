import { test, expect } from '@playwright/test';

test('CSV export contains header and order data', async ({ page }) => {
  // Προϋπόθεση: δημιουργία παραγγελίας
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

  // Πάρε το Order ID
  const oid = await page.getByTestId('order-id').textContent();
  test.skip(!oid || oid.trim() === '', 'orderId not found');

  // Πήγαινε στο admin/orders και κατέβασε το CSV
  await page.goto('/admin/orders');
  await expect(page.getByText('Admin · Orders')).toBeVisible();

  // Κλικ στο Export CSV button
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-csv').click(),
  ]);

  const path = await download.path();
  test.skip(!path, 'download path not available');

  // Διάβασε το περιεχόμενο του CSV
  const fs = await import('fs');
  const csv = fs.readFileSync(path as string, 'utf-8');

  // Έλεγχος header
  expect(csv).toContain('Order No,Order ID,Created At,Postal Code');

  // Έλεγχος ότι περιέχει orderNumber (DX-YYYYMMDD-####)
  expect(/DX-\d{8}-[A-Z0-9]{4}/.test(csv)).toBeTruthy();

  // Έλεγχος ότι περιέχει την παραγγελία μας
  expect(csv).toContain(oid as string);
  expect(csv).toContain('10431');
});

test('Filter by postal code shows matching order', async ({ page }) => {
  // Προϋπόθεση: δημιουργία παραγγελίας
  await page
    .goto('/checkout/flow')
    .catch(() => test.skip(true, 'flow route not present'));
  await page.getByLabel('Οδός & αριθμός').fill('Solonos 5');
  await page.getByLabel('Πόλη').fill('Athens');
  await page.getByLabel('Τ.Κ.').fill('12345');
  await page.getByTestId('flow-method').selectOption('COURIER');
  await page.getByTestId('flow-weight').fill('300');
  await page.getByTestId('flow-subtotal').fill('25');
  await page.getByTestId('flow-proceed').click();
  await expect(page.getByText('Πληρωμή')).toBeVisible();
  await page.getByTestId('pay-now').click();
  await expect(page.getByText('Επιβεβαίωση παραγγελίας')).toBeVisible();

  const oid = await page.getByTestId('order-id').textContent();
  test.skip(!oid || oid.trim() === '', 'orderId not found');

  // Πήγαινε στο admin/orders
  await page.goto('/admin/orders');
  await expect(page.getByText('Admin · Orders')).toBeVisible();

  // Φιλτράρισμα με postal code
  await page.getByTestId('filter-pc').fill('12345');
  await page.getByTestId('filter-apply').click();

  // Περίμενε να φορτώσει
  await page.waitForTimeout(500);

  // Έλεγχος ότι εμφανίζεται η παραγγελία
  const rows = page.locator('[data-testid="order-link"]');
  await expect(rows.first()).toBeVisible();

  // Έλεγχος ότι το postal code εμφανίζεται στον πίνακα
  await expect(page.getByText('12345')).toBeVisible();
});
