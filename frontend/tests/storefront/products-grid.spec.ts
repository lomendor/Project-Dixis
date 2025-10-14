import { test, expect } from '@playwright/test';

test.describe('Products Grid - Storefront polish', () => {
  test('Products grid renders with cards and Greek labels', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to products page
    await page.goto('/products');

    // Wait for products grid to be visible
    const grid = page.locator('[data-testid="products-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    // Check for product cards
    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Verify first card has expected structure
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();

      // Check if image or placeholder is present
      const hasImage = await firstCard.locator('img').count() > 0;
      const hasPlaceholder = await firstCard.locator('svg').count() > 0;
      expect(hasImage || hasPlaceholder).toBeTruthy();

      // Verify price formatting (EUR)
      const priceText = await firstCard.textContent();
      expect(priceText).toMatch(/€/);
    } else {
      // Empty state should be visible
      const emptyState = page.locator('[data-testid="empty-state"]');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('Δεν υπάρχουν προϊόντα');
    }

    // Verify Greek filter labels are present
    await expect(page.getByText('Φίλτρα')).toBeVisible();
    await expect(page.getByText('Εφαρμογή')).toBeVisible();

    // Assert no console errors
    expect(consoleErrors, `Expected no console errors, but found: ${consoleErrors.join('\n')}`).toHaveLength(0);
  });

  test('Product cards are clickable and navigate to detail page', async ({ page }) => {
    await page.goto('/products');

    const grid = page.locator('[data-testid="products-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    const cards = page.locator('[data-testid="product-card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Click first product card
      const firstCard = cards.first();
      await firstCard.click();

      // Verify navigation to product detail page
      await page.waitForURL(/\/products\/.+/);

      // Check for product detail elements
      const productTitle = page.locator('[data-testid="product-title"]');
      await expect(productTitle).toBeVisible({ timeout: 5000 });
    }
  });
});
