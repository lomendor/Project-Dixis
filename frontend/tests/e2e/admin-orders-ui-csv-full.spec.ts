import { test, expect } from '@playwright/test';

test('Orders UI: Full CSV export downloads file', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=5');
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-csv-full').click(),
  ]);
  const fname = download.suggestedFilename();
  expect(fname).toMatch(/orders_full_\d{4}-\d{2}-\d{2}\.csv$/);
});
