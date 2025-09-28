import { Page, expect } from '@playwright/test';

/**
 * Robust wait for products API + visible cards
 * Fixes timing issues where API returns data but UI hasn't rendered
 */
export async function waitForProductCards(page: Page, timeout = 30000): Promise<void> {
  // First wait for API response
  await page.waitForResponse(r => r.url().includes('/api/v1/products') && r.ok(), { timeout });
  
  // Then wait for at least one card to be visible
  await page.waitForSelector('[data-testid="product-card"]', { timeout, state: 'visible' });
  
  // Small buffer for rendering completion
  await page.waitForTimeout(500);
}

/**
 * Wait for specific number of product cards
 */
export async function waitForProductCardsCount(page: Page, expectedCount: number, timeout = 30000): Promise<void> {
  await waitForProductCards(page, timeout);
  const cards = page.locator('[data-testid="product-card"]');
  await expect(cards).toHaveCount(expectedCount, { timeout });
}
