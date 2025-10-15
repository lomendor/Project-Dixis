/**
 * Smoke Test: Products page ("/products") loads without i18n/hydration errors
 *
 * Purpose: Verify baseline functionality after URL handling changes
 * Success: Page loads, products grid visible, no console errors for i18n/hydration
 */

import { test, expect } from '@playwright/test';

test.describe('Products page smoke test', () => {
  test('should load Products page without i18n or hydration errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (
        text.includes('INVALID_KEY') ||
        text.includes('MISSING_MESSAGE') ||
        text.includes('hydration') ||
        text.includes('Hydration')
      ) {
        errors.push(text);
      }
    });

    await page.goto('/products', { waitUntil: 'networkidle' });

    // Verify page loaded with products grid or empty state
    const hasProducts = await page.locator('[data-testid="products-grid"]').isVisible();
    const hasEmpty = await page.locator('[data-testid="empty-state"]').isVisible();

    expect(hasProducts || hasEmpty, 'Products page should show grid or empty state').toBe(true);

    // Verify no i18n/hydration errors
    expect(errors, 'Found i18n or hydration errors on Products').toHaveLength(0);
  });
});
