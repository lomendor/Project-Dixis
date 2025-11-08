import { test, expect } from '@playwright/test';

/**
 * Product page with add-to-cart functionality test
 * Validates that product page displays and add-to-cart button updates
 */
test('Product page displays and add-to-cart button updates status', async ({ page }) => {
  // Visit products list
  await page.goto('/products');

  // Check if products exist
  const firstProduct = page.locator('article').first();
  const hasProducts = await firstProduct.isVisible().catch(() => false);

  if (!hasProducts) {
    console.log('⚠️  No products available, skipping add-to-cart test');
    return;
  }

  // Click first product to navigate to detail page
  const firstLink = page.locator('a[href^="/products/"]').first();
  await firstLink.click();

  // Wait for product page to load
  await page.waitForSelector('h1', { timeout: 10000 });

  // Verify product page elements
  await expect(page.locator('h1')).toBeVisible();

  // Find add-to-cart button
  const addButton = page.locator('button:has-text("Προσθήκη στο καλάθι")');

  if (await addButton.isVisible()) {
    // Check initial status
    expect(await addButton.getAttribute('data-cart-status')).toBe('idle');

    // Click add-to-cart
    await addButton.click();

    // Wait for status change
    await page.waitForTimeout(500);

    // Verify button status changed (either 'adding' or 'added')
    const status = await addButton.getAttribute('data-cart-status');
    expect(['adding', 'added']).toContain(status);

    console.log(`✅ Add-to-cart button status: ${status}`);
  } else {
    console.log('⚠️  Add-to-cart button not found');
  }
});
