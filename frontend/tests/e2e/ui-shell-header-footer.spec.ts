import { test, expect } from '@playwright/test';

/**
 * UI Shell Header/Footer Tests
 *
 * Pass: UI-SHELL-HEADER-FOOTER-01
 * Purpose: Verify header shows ONLY expected items per role,
 *          and footer does NOT contain "Order Tracking" link.
 */

test.describe('UI Shell - Header @smoke', () => {
  test.describe('Guest user', () => {
    test.beforeEach(async ({ page }) => {
      // Clear any auth for guest tests
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
      });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    });

    test('header shows correct elements for guest', async ({ page }) => {
      // Logo should be visible
      await expect(page.locator('[data-testid="header-logo"]')).toBeVisible();

      // Primary nav should show Products and Producers (hidden on mobile, visible on desktop)
      const nav = page.locator('[data-testid="header-primary-nav"]');
      // The nav might be hidden on small viewports, so just check it exists
      await expect(nav).toBeAttached();

      // Cart should be visible for guest (testid: nav-cart-guest)
      await expect(page.locator('[data-testid="nav-cart-guest"]')).toBeVisible({ timeout: 10000 });

      // Login and Register should be visible (desktop only)
      await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();

      // User menu should NOT be visible (guest is not authenticated)
      await expect(page.locator('[data-testid="header-user-menu"]')).not.toBeVisible();

      // Language switcher should NOT be in header
      await expect(page.locator('header [data-testid="footer-language-switcher"]')).not.toBeVisible();
    });
  });

  test.describe('Consumer user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('user_id', '1');
        localStorage.setItem('user_role', 'consumer');
        localStorage.setItem('user_email', 'consumer@example.com');
        localStorage.setItem('user_name', 'Test Consumer');
        localStorage.setItem('e2e_mode', 'true');
      });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    });

    test('header shows correct elements for consumer', async ({ page }) => {
      // Logo should be visible
      await expect(page.locator('[data-testid="header-logo"]')).toBeVisible();

      // Cart should be visible (testid: nav-cart)
      await expect(page.locator('[data-testid="nav-cart"]')).toBeVisible();

      // User menu should be visible
      const userMenu = page.locator('[data-testid="header-user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 10000 });

      // Open dropdown
      await userMenu.click();

      // Consumer should see "My Orders"
      await expect(page.locator('[data-testid="user-menu-orders"]')).toBeVisible();

      // Consumer should see Logout
      await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

      // Consumer should NOT see producer dashboard
      await expect(page.locator('[data-testid="user-menu-dashboard"]')).not.toBeVisible();

      // Consumer should NOT see admin link
      await expect(page.locator('[data-testid="user-menu-admin"]')).not.toBeVisible();
    });
  });

  test.describe('Producer user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('user_id', '2');
        localStorage.setItem('user_role', 'producer');
        localStorage.setItem('user_email', 'producer@example.com');
        localStorage.setItem('user_name', 'Test Producer');
        localStorage.setItem('e2e_mode', 'true');
      });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    });

    test('header shows correct elements for producer', async ({ page }) => {
      // Logo should be visible
      await expect(page.locator('[data-testid="header-logo"]')).toBeVisible();

      // Cart should be visible for producers (they can also shop)
      await expect(page.locator('[data-testid="nav-cart"]')).toBeVisible();

      // User menu should be visible
      const userMenu = page.locator('[data-testid="header-user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 10000 });

      // Open dropdown
      await userMenu.click();

      // Producer should see dashboard
      await expect(page.locator('[data-testid="user-menu-dashboard"]')).toBeVisible();

      // Producer should see producer orders
      await expect(page.locator('[data-testid="user-menu-producer-orders"]')).toBeVisible();

      // Producer should see Logout
      await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

      // Producer should NOT see consumer "My Orders"
      await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();

      // Producer should NOT see admin link
      await expect(page.locator('[data-testid="user-menu-admin"]')).not.toBeVisible();
    });
  });

  test.describe('Admin user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('auth_token', 'mock_token');
        localStorage.setItem('user_id', '3');
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('user_email', 'admin@example.com');
        localStorage.setItem('user_name', 'Test Admin');
        localStorage.setItem('e2e_mode', 'true');
      });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    });

    test('header shows correct elements for admin', async ({ page }) => {
      // Logo should be visible
      await expect(page.locator('[data-testid="header-logo"]')).toBeVisible();

      // Cart should be visible (testid: nav-cart-admin)
      await expect(page.locator('[data-testid="nav-cart-admin"]')).toBeVisible();

      // User menu should be visible
      const userMenu = page.locator('[data-testid="header-user-menu"]');
      await expect(userMenu).toBeVisible({ timeout: 10000 });

      // Open dropdown
      await userMenu.click();

      // Admin should see admin link
      await expect(page.locator('[data-testid="user-menu-admin"]')).toBeVisible();

      // Admin should see Logout
      await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

      // Admin should NOT see consumer "My Orders"
      await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();

      // Admin should NOT see producer dashboard
      await expect(page.locator('[data-testid="user-menu-dashboard"]')).not.toBeVisible();
    });
  });
});

test.describe('UI Shell - Footer @smoke', () => {
  test('footer does NOT contain Order Tracking link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll to footer to ensure it's in viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Footer quick links section
    const quickLinks = page.locator('[data-testid="footer-quick-links"]');
    await expect(quickLinks).toBeVisible({ timeout: 10000 });

    // "Παρακολούθηση Παραγγελίας" should NOT be present
    await expect(quickLinks.getByText('Παρακολούθηση Παραγγελίας')).not.toBeVisible();

    // But "Προϊόντα" and "Παραγωγοί" should still be there
    await expect(quickLinks.getByText('Προϊόντα')).toBeVisible();
    await expect(quickLinks.getByText('Παραγωγοί')).toBeVisible();
  });

  test('footer language switcher is visible and stable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll to footer to ensure it's in viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Language switcher should be in footer
    const langSwitcher = page.locator('[data-testid="footer-language-switcher"]');
    await expect(langSwitcher).toBeVisible({ timeout: 10000 });

    // Should have EL and EN buttons
    await expect(page.locator('[data-testid="footer-lang-el"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer-lang-en"]')).toBeVisible();
  });
});
