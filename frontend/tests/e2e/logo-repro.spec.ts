import { test, expect } from '@playwright/test';

/**
 * Logo Visibility Tests (Pass UI-HEADER-NAV-03)
 *
 * Validates that the logo/home button is visible for ALL user states:
 * - Guest (not logged in)
 * - Logged-in (consumer, producer, admin)
 * - Mobile viewport
 *
 * The logo must ALWAYS be visible and link to "/".
 * This is a regression test for the bug where logo was hidden when logged-in.
 */

test.describe('Logo Visibility - Core Tests @smoke', () => {

  test('logo is visible for GUEST and links to home', async ({ page, context }) => {
    // Clear auth state to ensure guest
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Logo MUST be visible
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });

    // Logo MUST link to home
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible with MOCK AUTH (simulated logged-in) and links to home', async ({ page }) => {
    // Use CI mock auth - set localStorage to simulate logged-in state
    await page.goto('/');
    await page.evaluate(() => {
      // Set mock auth tokens that AuthContext recognizes
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@example.com');
      localStorage.setItem('user_name', 'E2E Test Consumer');
      localStorage.setItem('e2e_mode', 'true');
    });

    // Reload to pick up auth state
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for auth state to be recognized (user name or logout button visible)
    await expect.poll(async () => {
      const hasLogout = await page.locator('[data-testid="logout-btn"]').isVisible().catch(() => false);
      const hasMobileLogout = await page.locator('[data-testid="mobile-logout-btn"]').isVisible().catch(() => false);
      const hasUserName = await page.locator('[data-testid="nav-user-name"]').isVisible().catch(() => false);
      return hasLogout || hasMobileLogout || hasUserName;
    }, { timeout: 15000, message: 'Mock auth should be recognized (logout button or user name visible)' }).toBe(true);

    // Logo MUST be visible when "logged in"
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });

    // Logo MUST link to home
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible on MOBILE viewport (guest)', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Clear auth state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Logo MUST be visible on mobile
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible on MOBILE viewport with MOCK AUTH', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Use mock auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_name', 'E2E Test Consumer');
      localStorage.setItem('e2e_mode', 'true');
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Logo MUST be visible on mobile when logged in
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('Track Order is NOT visible in top nav (UI-HEADER-NAV-02)', async ({ page, context }) => {
    // Clear auth state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Track Order should NOT be in the nav
    const trackOrderLink = page.locator('header nav').getByRole('link', { name: /παρακολούθηση|track order/i });
    await expect(trackOrderLink).not.toBeVisible();
  });
});
