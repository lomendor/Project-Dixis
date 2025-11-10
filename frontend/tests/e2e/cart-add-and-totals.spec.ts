import { test, expect } from '@playwright/test';

test('Add to cart updates badge and shows grand total', async ({ page, request }) => {
  // Get first product
  const listResponse = await request.get('/api/products');
  const data = await listResponse.json();
  const firstProduct = data?.items?.[0];
  test.skip(!firstProduct, 'No products available');

  // Navigate to products page
  await page.goto('/products');

  // Find and click first add-to-cart button
  const addButton = page.getByTestId('add-to-cart').first();
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  // Wait for cart update and verify badge shows count > 0
  await page.waitForTimeout(1000); // Allow time for event to propagate
  const badgeText = await page.locator('a[aria-label*="Καλάθι"]').textContent();
  const count = parseInt(badgeText?.match(/\d+/)?.[0] || '0');
  expect(count).toBeGreaterThan(0);

  // Navigate to cart page
  await page.goto('/cart');

  // Verify summary section is visible
  await expect(page.getByText('Σύνοψη Παραγγελίας')).toBeVisible({ timeout: 10000 });

  // Verify grand total is not 0.00
  const grandTotal = page.getByTestId('cart-grand-total');
  await expect(grandTotal).toBeVisible();
  const totalText = await grandTotal.textContent();
  expect(totalText).not.toContain('0.00');
  expect(totalText).toMatch(/\d+\.\d{2}/);
});
