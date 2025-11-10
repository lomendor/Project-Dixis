import { test, expect } from '@playwright/test';

test('Cart totals render with grand total', async ({ page, request }) => {
  // Get first product from API
  const listResponse = await request.get('/api/products');
  const data = await listResponse.json();
  const firstProduct = data?.items?.[0];

  test.skip(!firstProduct, 'No products available');

  // Navigate to product page
  await page.goto(`/products/${firstProduct.id}`);

  // Add to cart
  const addToCartButton = page.getByTestId('add-to-cart');
  await expect(addToCartButton).toBeVisible({ timeout: 10000 });
  await addToCartButton.click();

  // Navigate to cart page
  await page.goto('/cart');

  // Verify cart totals section is visible
  await expect(page.getByText('Σύνοψη Παραγγελίας')).toBeVisible({ timeout: 10000 });

  // Verify grand total element exists
  const grandTotal = page.getByTestId('cart-grand-total');
  await expect(grandTotal).toBeVisible();

  // Verify it contains numeric value
  const totalText = await grandTotal.textContent();
  expect(totalText).toMatch(/\d+\.\d{2}/);
});
