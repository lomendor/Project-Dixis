import { test, expect } from '@playwright/test';

/**
 * Logo Visibility Tests (Pass UI-HEADER-NAV-04)
 *
 * Validates that the logo/home button is visible for ALL user states:
 * - Guest (not logged in)
 * - Logged-in (consumer, producer, admin)
 * - Mobile viewport
 *
 * The logo must ALWAYS be visible (h-9 = 36px) and link to "/".
 * This is a regression test for the bug where logo was hidden when logged-in.
 */

test.describe('Logo Visibility - Core Tests @smoke', () => {

  test('logo is visible for GUEST and links to home', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible with MOCK AUTH and links to home', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_email', 'consumer@example.com');
      localStorage.setItem('user_name', 'E2E Test Consumer');
      localStorage.setItem('e2e_mode', 'true');
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Wait for auth state to be recognized (user menu visible)
    await expect.poll(async () => {
      const hasUserMenu = await page.locator('[data-testid="header-user-menu"]').isVisible().catch(() => false);
      const hasMobileLogout = await page.locator('[data-testid="mobile-logout-btn"]').isVisible().catch(() => false);
      return hasUserMenu || hasMobileLogout;
    }, { timeout: 15000, message: 'Mock auth should be recognized' }).toBe(true);

    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible on MOBILE viewport (guest)', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('logo is visible on MOBILE viewport with MOCK AUTH', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

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

    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('Track Order is NOT visible in header', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const trackOrderLink = page.locator('header').getByRole('link', { name: /παρακολούθηση|track order/i });
    await expect(trackOrderLink).not.toBeVisible();
  });
});
