/**
 * Pass FIX-HOMEPAGE-HYDRATION-01: Verify no React hydration errors on homepage.
 *
 * This test catches React error #418 (hydration mismatch) that occurs when
 * server-rendered HTML doesn't match client-side initial render.
 */
import { test, expect } from '@playwright/test';

test.describe('Homepage Hydration', () => {
  test('should load homepage without React hydration errors', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');

    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState('networkidle');

    // Wait a bit for any async hydration to complete
    await page.waitForTimeout(1000);

    // Check for React hydration error #418
    const hydrationErrors = consoleErrors.filter(
      (error) =>
        error.includes('Minified React error #418') ||
        error.includes('Hydration failed') ||
        error.includes('Text content does not match') ||
        error.includes('did not match')
    );

    // Log all errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    // Assert no hydration errors
    expect(hydrationErrors, 'Expected no React hydration errors').toHaveLength(0);
  });

  test('should load homepage with auth loading state visible briefly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // The auth loading placeholder should exist briefly or the actual auth UI
    // This test ensures the page renders something (not blank)
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Page should have main content
    const main = page.locator('main[data-testid="page-root"]');
    await expect(main).toBeVisible();
  });

  test('should not show React error #418 when navigating between pages', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForLoadState('networkidle');

    // Navigate back to homepage
    await page.click('header a[data-testid="header-logo"]');
    await page.waitForLoadState('networkidle');

    // Check for hydration errors accumulated during navigation
    const hydrationErrors = consoleErrors.filter(
      (error) =>
        error.includes('Minified React error #418') ||
        error.includes('Hydration failed')
    );

    expect(hydrationErrors, 'Expected no React hydration errors during navigation').toHaveLength(0);
  });
});
