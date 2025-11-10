import { test, expect } from '@playwright/test';

test('Orders lookup returns placed order by email+orderId', async ({ page, request }) => {
  // 1) Get product
  const list = await request.get('/api/products'); const data = await list.json();
  const p = data?.items?.[0]; test.skip(!p, 'No products');

  // 2) Create order via UI
  await page.goto('/products');
  await page.getByTestId('add-to-cart').first().click();
  await page.goto('/checkout');
  await page.getByPlaceholder('Email *').fill('bot@example.com');
  await page.getByRole('button', { name: 'Καταχώριση παραγγελίας' }).click();
  await page.waitForURL(/\/checkout\/confirmation\?orderId=/);
  const orderId = await page.getByTestId('order-id').innerText();

  // 3) Visit lookup page & query
  await page.goto('/orders/id-lookup');
  await page.getByPlaceholder('Email *').fill('bot@example.com');
  await page.getByPlaceholder('Κωδικός παραγγελίας *').fill(orderId);
  await page.getByRole('button', { name: 'Αναζήτηση' }).click();

  await expect(page.getByTestId('lookup-result')).toBeVisible();
});
