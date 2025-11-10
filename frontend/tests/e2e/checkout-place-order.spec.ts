import { test, expect } from '@playwright/test';

test('Checkout places a draft order and shows success', async ({ page, request }) => {
  const list = await request.get('/api/products'); const data = await list.json();
  const first = data?.items?.[0]; test.skip(!first, 'No products');
  await page.goto('/products'); await page.getByTestId('add-to-cart').first().click();
  await page.goto('/checkout');
  await page.getByPlaceholder('Email *').fill('bot@example.com');
  await page.getByPlaceholder('Ονοματεπώνυμο').fill('Bot Tester');
  await page.getByRole('button', { name: 'Καταχώριση παραγγελίας' }).click();
  await expect(page).toHaveURL(/\/checkout\/success\?order=/);
  await expect(page.getByTestId('order-id')).toBeVisible();
});
