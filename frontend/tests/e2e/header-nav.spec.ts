import { test, expect } from '@playwright/test';

/**
 * Header Navigation E2E Tests (Pass UI-HEADER-NAV-04)
 *
 * Validates header/navbar behavior per docs/PRODUCT/HEADER-NAV-V1.md
 * - Logo always visible (h-9, 36px) and links to home
 * - Primary nav: Products, Producers (max 2-3 links)
 * - User dropdown for authenticated users (name + role links + logout)
 * - No Track Order in header
 * - No username as standalone nav text
 * - Mobile: hamburger menu with role links
 */

test.describe('Header Navigation - Guest @smoke', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('logo is visible and links to home', async ({ page }) => {
    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('primary nav shows Products and Producers', async ({ page }) => {
    const nav = page.locator('[data-testid="header-primary-nav"]');
    await expect(nav.getByRole('link', { name: /προϊόντα|products/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /παραγωγοί|producers/i })).toBeVisible();
  });

  test('guest shows Login and Register buttons', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();
  });

  test('Track Order link is NOT in header', async ({ page }) => {
    const trackOrderLink = page.locator('header').getByRole('link', { name: /παρακολούθηση|track order/i });
    await expect(trackOrderLink).not.toBeVisible();
  });

  test('Forbidden link is NOT in header', async ({ page }) => {
    const forbiddenLink = page.locator('header').getByRole('link', { name: /απαγορεύεται|forbidden/i });
    await expect(forbiddenLink).not.toBeVisible();
  });

  test('language toggle is NOT in header (moved to footer)', async ({ page }) => {
    // Language switcher has been moved to footer per UI-HEADER-NAV-CLARITY-01
    const headerLangEl = page.locator('header [data-testid="lang-el"]');
    const headerLangEn = page.locator('header [data-testid="lang-en"]');
    await expect(headerLangEl).not.toBeVisible();
    await expect(headerLangEn).not.toBeVisible();

    // Verify it's in the footer instead
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByTestId('footer-lang-el')).toBeVisible({ timeout: 5000 });
  });

  test('user dropdown NOT visible for guest', async ({ page }) => {
    await expect(page.locator('[data-testid="header-user-menu"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Consumer with Mock Auth @smoke', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('logo is visible when logged in', async ({ page }) => {
    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('login/register NOT visible when logged in', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).not.toBeVisible();
  });

  test('user dropdown is visible and works', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 10000 });

    // Click to open dropdown
    await userMenu.click();

    // User name in dropdown
    await expect(page.locator('[data-testid="user-menu-name"]')).toBeVisible();

    // My Orders link in dropdown
    await expect(page.locator('[data-testid="user-menu-orders"]')).toBeVisible();

    // Logout in dropdown
    await expect(page.locator('[data-testid="user-menu-logout"]')).toBeVisible();
  });

  test('username NOT displayed as standalone nav text', async ({ page }) => {
    // Old testid for standalone username should not exist
    await expect(page.locator('[data-testid="nav-user-name"]')).not.toBeVisible();
  });

  test('admin/producer dropdown links NOT visible for consumer', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await userMenu.click();

    await expect(page.locator('[data-testid="user-menu-admin"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu-dashboard"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Producer with Mock Auth @smoke', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('producer dashboard link in user dropdown', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 10000 });
    await userMenu.click();

    await expect(page.locator('[data-testid="user-menu-dashboard"]')).toBeVisible();
  });

  test('admin/my-orders NOT in dropdown for producer', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await userMenu.click();

    await expect(page.locator('[data-testid="user-menu-admin"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Admin with Mock Auth @smoke', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('admin link in user dropdown', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 10000 });
    await userMenu.click();

    await expect(page.locator('[data-testid="user-menu-admin"]')).toBeVisible();
  });

  test('producer/my-orders NOT in dropdown for admin', async ({ page }) => {
    const userMenu = page.locator('[data-testid="header-user-menu"]');
    await userMenu.click();

    await expect(page.locator('[data-testid="user-menu-dashboard"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-menu-orders"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Mobile @smoke', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  });

  test('mobile menu opens and shows nav items', async ({ page }) => {
    await page.locator('[data-testid="mobile-menu-button"]').click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-register"]')).toBeVisible();
  });

  test('logo is visible on mobile (guest)', async ({ page }) => {
    const logo = page.locator('[data-testid="header-logo"]');
    await expect(logo).toBeVisible();
  });

  test('logo is visible on mobile with mock auth (UI-HEADER-NAV-03 regression)', async ({ page }) => {
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

    const boundingBox = await logo.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test('mobile menu shows role links when authenticated', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_name', 'E2E Test Consumer');
      localStorage.setItem('e2e_mode', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await page.locator('[data-testid="mobile-menu-button"]').click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-user-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-logout-btn"]')).toBeVisible();
  });
});
