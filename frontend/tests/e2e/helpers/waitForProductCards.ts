import { Page, expect } from '@playwright/test';

/**
 * Wait for product cards to be visible before proceeding with test assertions
 * Fixes timing issues where API returns products but frontend hasn't rendered them yet
 */
export async function waitForProductCards(page: Page, timeout = 15000): Promise<void> {
  // Wait for at least one product card to be visible
  const productCard = page.locator('[data-testid="product-card"]').first();
  await expect(productCard).toBeVisible({ timeout });
  
  // Small additional wait for all cards to render
  await page.waitForTimeout(500);
}

/**
 * Wait for specific number of product cards (useful for search results)
 */
export async function waitForProductCardsCount(page: Page, expectedCount: number, timeout = 15000): Promise<void> {
  const productCards = page.locator('[data-testid="product-card"]');
  await expect(productCards).toHaveCount(expectedCount, { timeout });
}