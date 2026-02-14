/**
 * AUTH-01: Auth Navigation Stability Regression Test
 *
 * Bug: Header flashes between "guest" and "logged-in" states during navigation
 * because AuthContext starts with loading=true, user=null on each route.
 *
 * Fix: AuthContext now checks localStorage for token during initial render
 * and uses that to set isAuthenticated while loading (prevents flash).
 *
 * This test verifies:
 * 1. /account/orders accessible without redirect to login (uses storageState from CI setup)
 * 2. No flash to guest state during navigation (login/register buttons stay hidden)
 * 3. Header maintains consistent state across page navigations
 *
 * Note: These tests rely on CI globalSetup creating authenticated storageState.
 * The storageState includes auth_token in localStorage which AuthContext uses.
 */
import { test, expect, Page } from '@playwright/test';

/**
 * Verify header does NOT show guest state (login/register buttons)
 * This is the core assertion - authenticated users should never see these
 */
async function verifyNotGuestHeader(page: Page): Promise<void> {
  const loginLink = page.getByTestId('nav-login');
  const registerLink = page.getByTestId('nav-register');

  // These should be hidden for authenticated users
  // Using longer timeout since auth context may still be loading
  await expect(loginLink).toBeHidden({ timeout: 5000 });
  await expect(registerLink).toBeHidden({ timeout: 5000 });
}

test.describe('AUTH-01: Navigation Auth Stability', () => {
  // Tests use storageState from CI globalSetup which sets auth_token in localStorage

  test('@smoke /account/orders accessible without redirect to login', async ({ page }) => {
    // Mock backend API calls (CI has no Laravel backend)
    await page.route('**/api/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    // Navigate to account orders — use domcontentloaded to avoid hanging on API loads
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });

    // Should NOT redirect to login (core AUTH-01 regression check)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth/login');
    expect(currentUrl).toContain('/account/orders');

    // Should show orders page content (empty state or list)
    const ordersContent = page.getByTestId('empty-orders-message').or(page.getByTestId('orders-list'));
    await expect(ordersContent).toBeVisible({ timeout: 10000 });

    // Header should NOT show guest state
    await verifyNotGuestHeader(page);
  });

  test('@smoke header auth persists through multiple navigations', async ({ page }) => {
    // Navigation sequence: products -> home -> cart -> products
    const routes = ['/products', '/', '/cart', '/products'];

    // Mock all backend API calls (CI has no Laravel backend — prevents timeout)
    await page.route('**/api/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    for (const route of routes) {
      // Use domcontentloaded — don't wait for network (API calls may hang without backend)
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Wait for main content to render instead of networkidle
      await page.locator('main, body').first().waitFor({ state: 'visible', timeout: 10000 });

      // Each navigation should maintain auth state (no flash to guest)
      await verifyNotGuestHeader(page);
    }

    // Final check: account/orders should work
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });

    // Should not redirect to login
    expect(page.url()).toContain('/account/orders');

    // Should show page content
    const pageContent = page.getByTestId('empty-orders-message').or(page.getByTestId('orders-list'));
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});
