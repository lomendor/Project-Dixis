/**
 * Smoke Test: Home page ("/") loads without i18n/hydration errors
 *
 * Purpose: Verify baseline functionality after URL handling changes
 * Success: Page loads, no console errors for i18n/hydration
 */

import { test, expect } from '@playwright/test';

test.describe('Home page smoke test', () => {
  test('should load Home without i18n or hydration errors', async ({ page }) => {
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

    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify page loaded with LCP anchor
    await expect(page.locator('[data-lcp-anchor="hero-raster"]')).toBeVisible();

    // Verify no i18n/hydration errors
    expect(errors, 'Found i18n or hydration errors on Home').toHaveLength(0);
  });
});
