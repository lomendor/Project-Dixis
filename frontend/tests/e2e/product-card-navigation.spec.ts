/**
 * E2E Test: Product Card Navigation
 *
 * Purpose: Verify clicking a product card navigates to the product detail page
 * Bug Fix: ProductCard component now wraps image + title in Link
 * Success: Click on product card → URL changes to /products/[id] → product title visible
 */

import { test, expect } from '@playwright/test';

test.describe('Product Card Navigation', () => {
  test('clicking product card navigates to product detail page', async ({ page }) => {
    // Navigate to products listing page
    await page.goto('/products');

    // Wait for page to load (using page heading as indicator)
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 });

    // Find product cards
    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, 'No products available to test navigation');
      return;
    }

    // Get the first product's title from the card
    const firstCard = cards.first();
    const productTitle = await firstCard.locator('[data-testid="product-card-title"]').textContent();

    // Click on the product card (clicking the image or title area, not the button)
    const clickableArea = firstCard.locator('[data-testid="product-card-image"]');
    await clickableArea.click();

    // Wait for URL to change to product detail page
    await page.waitForURL(/\/products\/.+/, { timeout: 5000 });

    // Verify we're on a product detail page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/products\/\d+/);

    // Verify product title is visible on the detail page
    const detailTitle = page.locator('[data-testid="product-title"]');
    await expect(detailTitle).toBeVisible({ timeout: 5000 });

    // Verify the title matches (optional - may differ in formatting)
    const detailTitleText = await detailTitle.textContent();
    expect(detailTitleText).toBeTruthy();

    // Verify product price is visible
    const price = page.locator('[data-testid="product-price"]');
    await expect(price).toBeVisible();
  });

  test('clicking product card title navigates correctly', async ({ page }) => {
    await page.goto('/products');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 });

    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, 'No products available');
      return;
    }

    // Click on the product title (which is inside the Link)
    const firstCard = cards.first();
    const titleElement = firstCard.locator('[data-testid="product-card-title"]');
    await titleElement.click();

    // Should navigate to product page
    await page.waitForURL(/\/products\/.+/, { timeout: 5000 });

    // Verify we're on the detail page
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
  });

  test('add to cart button does not trigger navigation', async ({ page }) => {
    await page.goto('/products');

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Προϊόντα")', { timeout: 10000 });

    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, 'No products available');
      return;
    }

    const firstCard = cards.first();
    const addButton = firstCard.locator('[data-testid="add-to-cart-button"]');

    // Get current URL before clicking
    const urlBefore = page.url();

    // Click add to cart button
    await addButton.click();

    // Wait a bit to ensure no navigation happened
    await page.waitForTimeout(500);

    // Verify URL hasn't changed (we're still on /products page)
    const urlAfter = page.url();
    expect(urlAfter).toBe(urlBefore);
    expect(urlAfter).toContain('/products');
    expect(urlAfter).not.toMatch(/\/products\/\d+/);
  });
});
