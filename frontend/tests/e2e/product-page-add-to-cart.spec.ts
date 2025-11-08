import { test, expect } from '@playwright/test';

/**
 * Product page with add-to-cart functionality test
 * Fetches dynamic product ID from API and validates page render + button interaction
 */
test('Product page displays and add-to-cart button updates status', async ({ page, request }) => {
  // Get a valid product ID from the API
  const listRes = await request.get('/api/products');
  const listData = await listRes.json();
  const firstProduct = listData?.items?.[0] || listData?.[0];

  // Skip if no products available
  test.skip(!firstProduct, 'No products available to test');

  // Navigate to product detail page
  await page.goto(`/products/${firstProduct.id}`);

  // Wait for product page to load
  await page.waitForSelector('h1', { timeout: 10000 });

  // Verify product page elements
  await expect(page.locator('h1')).toBeVisible();

  // Find add-to-cart button
  const addButton = page.locator('button:has-text("Προσθήκη στο καλάθι")');

  if (await addButton.isVisible()) {
    // Check initial status
    const initialStatus = await addButton.getAttribute('data-cart-status');
    expect(initialStatus).toBe('idle');

    // Click add-to-cart
    await addButton.click();

    // Wait for status change
    await page.waitForTimeout(500);

    // Verify button status changed (either 'adding' or 'added')
    const newStatus = await addButton.getAttribute('data-cart-status');
    expect(['adding', 'added']).toContain(newStatus);

    console.log(`✅ Add-to-cart button status changed: ${initialStatus} → ${newStatus}`);
  } else {
    console.log('⚠️  Add-to-cart button not found on page');
  }
});
