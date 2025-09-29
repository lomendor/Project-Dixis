import { Page, expect } from '@playwright/test';

/**
 * Waits for products API response and visible product cards
 * Addresses product-card timeout failures in CI environment
 */
export async function waitForProductsApiAndCards(page: Page) {
  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');

  // Wait for products API response (with graceful fallback)
  try {
    await page.waitForResponse(r => /\/api\/.*product/i.test(r.url()) && r.ok(), { timeout: 30000 });
  } catch {
    // API might already be loaded, continue to element checks
  }

  // Wait for first product card to be visible
  const first = page.getByTestId(/^product-card(|-|_)/).first();
  await first.waitFor({ state: 'visible', timeout: 20000 });

  // Additional stability wait (graceful fallback)
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // Network might still be active, proceed if elements are visible
  }

  // Final visibility assertion
  await expect(first).toBeVisible();
}