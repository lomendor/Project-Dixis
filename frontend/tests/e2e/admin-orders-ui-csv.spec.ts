import { test, expect } from '@playwright/test';

test('Orders UI: CSV export downloads current view', async ({ page }) => {
  await page.goto('/admin/orders?useApi=1&mode=demo&page=1&pageSize=3');
  await expect(page.getByTestId('results-count')).toBeVisible();

  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-csv').click(),
  ]);

  const fname = download.suggestedFilename();
  expect(fname).toMatch(/orders_\d{4}-\d{2}-\d{2}\.csv$/);

  const content = await download.createReadStream();
  let buf = Buffer.alloc(0);
  for await (const chunk of content!) { buf = Buffer.concat([buf, chunk as Buffer]); }
  const text = buf.toString('utf8');

  expect(text).toContain('Order');
  expect(text).toContain('Πελάτης');
  expect(text).toContain('Σύνολο');
  expect(text).toContain('Κατάσταση');
});
