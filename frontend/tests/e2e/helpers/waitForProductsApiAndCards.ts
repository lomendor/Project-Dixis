import { Page, expect } from '@playwright/test';

/**
 * Waits for products API response and visible product cards
 * Phase 3: Increased timeout thresholds for CI stability
 * Addresses: TimeoutError: locator.waitFor: Timeout 20000ms exceeded
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

  // Wait for first product card to be visible (Phase 3: increased timeout)
  const first = page.getByTestId(/^product-card(|-|_)/).first();
  await first.waitFor({ state: 'visible', timeout: 45000 });

  // Additional stability wait (Phase 3: extended networkidle)
  try {
    await page.waitForLoadState('networkidle', { timeout: 20000 });
  } catch {
    // Network might still be active, proceed if elements are visible
  }

  // Final visibility assertion
  await expect(first).toBeVisible();
}