import { test, expect } from '@playwright/test';

/**
 * Header Screenshot Proof (Pass NAV-ENTRYPOINTS-HEADER-V1-01)
 *
 * Evidence capture for header navigation verification.
 * Captures screenshots in different auth states.
 *
 * NOTE: CartIcon uses different testids per role:
 * - Guest: nav-cart-guest
 * - Consumer: nav-cart
 * - Admin: nav-cart-admin
 * - Producer: HIDDEN (returns null, no element rendered)
 */

const SCREENSHOT_DIR = 'test-results/header-proof';

test.describe('Header Screenshot Proof @evidence', () => {

  test('PROOF: Guest header state', async ({ page }) => {
    // Clear all auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify guest state
    await expect(page.locator('[data-testid="header-logo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();

    // Cart uses nav-cart-guest testid for guests (use .first() - desktop + mobile both exist)
    await expect(page.locator('[data-testid="nav-cart-guest"]').first()).toBeVisible();

    // Verify NO language toggle in header
    await expect(page.locator('header [data-testid="lang-el"]')).not.toBeVisible();
    await expect(page.locator('header [data-testid="lang-en"]')).not.toBeVisible();

    // Verify NO track order in header
    const trackOrder = page.locator('header').getByRole('link', { name: /παρακολούθηση|track order/i });
    await expect(trackOrder).not.toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-guest.png`, fullPage: false });

    // Also capture just the header
    const header = page.locator('header');
    await header.screenshot({ path: `${SCREENSHOT_DIR}/header-guest-cropped.png` });
  });

  test('PROOF: Consumer (logged-in) header state', async ({ page }) => {
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

    // Verify logged-in state
    await expect(page.locator('[data-testid="header-logo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible();

    // Cart uses nav-cart testid for consumers (use .first() - desktop + mobile both exist)
    await expect(page.locator('[data-testid="nav-cart"]').first()).toBeVisible();

    // Verify NO login/register
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).not.toBeVisible();

    // Capture screenshot (closed menu)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-consumer-closed.png`, fullPage: false });

    // Open user menu and capture
    await page.locator('[data-testid="header-user-menu"]').click();
    await expect(page.locator('[data-testid="user-menu-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-consumer-menu-open.png`, fullPage: false });
  });

  test('PROOF: Producer header state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '2');
      localStorage.setItem('user_role', 'producer');
      localStorage.setItem('user_email', 'producer@example.com');
      localStorage.setItem('user_name', 'E2E Test Producer');
      localStorage.setItem('e2e_mode', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify producer state
    await expect(page.locator('[data-testid="header-logo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible();

    // Cart is completely hidden for producers (returns null)
    const guestCart = page.locator('[data-testid="nav-cart-guest"]');
    const consumerCart = page.locator('[data-testid="nav-cart"]');
    const adminCart = page.locator('[data-testid="nav-cart-admin"]');

    // Producer should not see any cart
    await expect(guestCart).not.toBeVisible();
    await expect(consumerCart).not.toBeVisible();
    await expect(adminCart).not.toBeVisible();

    // Capture screenshot (closed menu)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-producer-closed.png`, fullPage: false });

    // Open user menu and verify producer links
    await page.locator('[data-testid="header-user-menu"]').click();
    await expect(page.locator('[data-testid="user-menu-dashboard"]')).toBeVisible();

    // Check for producer orders link - this was added in UX-DASHBOARD-ENTRYPOINTS-01
    const producerOrdersLink = page.locator('[data-testid="user-menu-producer-orders"]');
    const producerOrdersVisible = await producerOrdersLink.isVisible().catch(() => false);

    await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

    // Verify NO consumer "My Orders" for producer
    await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-producer-menu-open.png`, fullPage: false });

    // Log finding for evidence
    console.log(`Producer Orders Link Visible: ${producerOrdersVisible}`);
  });

  test('PROOF: Admin header state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '3');
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_email', 'admin@example.com');
      localStorage.setItem('user_name', 'E2E Test Admin');
      localStorage.setItem('e2e_mode', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify admin state
    await expect(page.locator('[data-testid="header-logo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="header-user-menu"]')).toBeVisible();

    // Cart uses nav-cart-admin testid for admin (use .first() - desktop + mobile both exist)
    await expect(page.locator('[data-testid="nav-cart-admin"]').first()).toBeVisible();

    // Capture screenshot (closed menu)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-admin-closed.png`, fullPage: false });

    // Open user menu and verify admin link
    await page.locator('[data-testid="header-user-menu"]').click();
    await expect(page.locator('[data-testid="user-menu-admin"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();

    // Verify NO producer/consumer links for admin
    await expect(page.locator('[data-testid="user-menu-dashboard"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-admin-menu-open.png`, fullPage: false });
  });

  test('PROOF: Mobile header (guest)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify mobile state
    await expect(page.locator('[data-testid="header-logo"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Capture screenshot (menu closed)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-mobile-guest-closed.png`, fullPage: false });

    // Open mobile menu
    await page.locator('[data-testid="mobile-menu-button"]').click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-register"]')).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/header-mobile-guest-menu-open.png`, fullPage: false });
  });
});
