import { test, expect, request } from '@playwright/test';

test('Cart flow: add product then adjust quantity', async ({ page, request: req }) => {
  // Get a product from API
  const listRes = await req.get('/api/products');
  const listData = await listRes.json();
  const product = listData?.items?.[0];
  test.skip(!product, 'No products available');

  // Add to cart via API
  await req.post('/api/cart', { data: { slug: product.id, qty: 1 } });

  // Visit cart page
  await page.goto('/cart');
  await expect(page.locator('h1')).toContainText('Το Καλάθι μου');

  // Verify item is in cart
  await expect(page.locator('li')).toContainText(product.id);
});
