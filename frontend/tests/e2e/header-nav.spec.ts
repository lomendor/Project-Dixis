import { test, expect } from '@playwright/test';

/**
 * Header Navigation E2E Tests (Pass UI-HEADER-NAV-02)
 *
 * Validates header/navbar behavior per docs/PRODUCT/HEADER-NAV-V1.md
 * - Logo always visible and links to home (guest + logged-in)
 * - Role-based nav items (Guest, Consumer, Producer, Admin)
 * - No dev/debug links (Απαγορεύεται / Forbidden)
 * - No "Track Order" in top nav (removed per UI-HEADER-NAV-02)
 * - Mobile hamburger menu works correctly
 */

test.describe('Header Navigation - Guest @smoke', () => {
  test.beforeEach(async ({ page, context }) => {
    // Ensure clean state - no auth
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
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('guest nav shows correct items', async ({ page }) => {
    // Should show Products link (use exact link, not aria-label which might match cart)
    await expect(page.locator('header nav').getByRole('link', { name: /προϊόντα|products/i })).toBeVisible();

    // Should show Producers link
    await expect(page.locator('header nav').getByRole('link', { name: /παραγωγοί|producers/i })).toBeVisible();

    // Should show Login link
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();

    // Should show Register link
    await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();

    // Should show Cart
    await expect(page.locator('[data-testid="nav-cart-guest"]')).toBeVisible();
  });

  test('Track Order link is NOT visible in top nav (UI-HEADER-NAV-02)', async ({ page }) => {
    // Track Order was removed from top nav per Pass UI-HEADER-NAV-02
    // It should NOT appear in the header navigation
    const trackOrderLink = page.locator('header nav').getByRole('link', { name: /παρακολούθηση|track order/i });
    await expect(trackOrderLink).not.toBeVisible();
  });

  test('Απαγορεύεται / Forbidden link is NOT visible', async ({ page }) => {
    // This link should never appear in the nav
    const forbiddenLink = page.locator('header').getByRole('link', { name: /απαγορεύεται|forbidden/i });
    await expect(forbiddenLink).not.toBeVisible();
  });

  test('language toggle is visible', async ({ page }) => {
    // Either desktop or mobile language toggle should be visible
    const desktopEl = page.locator('[data-testid="lang-el"]');
    const mobileEl = page.locator('[data-testid="mobile-lang-el"]');

    await expect.poll(async () => {
      const desktopVisible = await desktopEl.isVisible().catch(() => false);
      const mobileVisible = await mobileEl.isVisible().catch(() => false);
      return desktopVisible || mobileVisible;
    }, { timeout: 10000 }).toBe(true);
  });

  test('admin/producer links NOT visible for guest', async ({ page }) => {
    // Admin link should not be visible
    await expect(page.locator('[data-testid="nav-admin"]')).not.toBeVisible();

    // Producer dashboard link should not be visible
    await expect(page.locator('[data-testid="nav-producer-dashboard"]')).not.toBeVisible();

    // My Orders should not be visible (requires login)
    await expect(page.locator('[data-testid="nav-my-orders"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Logged-in Consumer @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Login as consumer
    await page.goto('/auth/login');

    // Wait for login form to be ready and hydration to complete
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Wait for React hydration to stabilize before interacting
    await page.waitForTimeout(500);

    // Use locator-based fill which handles re-attaching elements
    await emailInput.fill('consumer@example.com');
    await page.locator('[name="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect or auth state change
    await page.waitForURL(/\//, { timeout: 15000 }).catch(() => {});
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('logo is visible after login', async ({ page }) => {
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible();
  });

  test('login/register links are NOT visible when logged in', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-login"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).not.toBeVisible();
  });

  test('My Orders link is visible for consumers', async ({ page }) => {
    // Poll for visibility in case of hydration delay
    await expect.poll(async () => {
      return await page.locator('[data-testid="nav-my-orders"]').isVisible().catch(() => false);
    }, { timeout: 10000 }).toBe(true);
  });

  test('logout button is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="logout-btn"]')).toBeVisible();
  });

  test('user name is displayed', async ({ page }) => {
    // User name should be visible somewhere in header
    await expect.poll(async () => {
      const hasDesktop = await page.locator('[data-testid="nav-user-name"]').isVisible().catch(() => false);
      const hasMobile = await page.locator('[data-testid="mobile-nav-user-name"]').isVisible().catch(() => false);
      return hasDesktop || hasMobile;
    }, { timeout: 10000 }).toBe(true);
  });

  test('admin/producer links NOT visible for consumer', async ({ page }) => {
    // Admin link should not be visible
    await expect(page.locator('[data-testid="nav-admin"]')).not.toBeVisible();

    // Producer dashboard link should not be visible
    await expect(page.locator('[data-testid="nav-producer-dashboard"]')).not.toBeVisible();
  });

  test('Απαγορεύεται / Forbidden link is NOT visible when logged in', async ({ page }) => {
    const forbiddenLink = page.locator('header').getByRole('link', { name: /απαγορεύεται|forbidden/i });
    await expect(forbiddenLink).not.toBeVisible();
  });
});

test.describe('Header Navigation - Producer Role @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Login as producer
    await page.goto('/auth/login');

    // Wait for login form to be ready and hydration to complete
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Wait for React hydration to stabilize before interacting
    await page.waitForTimeout(500);

    // Use locator-based fill which handles re-attaching elements
    await emailInput.fill('producer@example.com');
    await page.locator('[name="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect
    await page.waitForURL(/\/|\/producer/, { timeout: 15000 }).catch(() => {});
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('producer dashboard link is visible', async ({ page }) => {
    await expect.poll(async () => {
      return await page.locator('[data-testid="nav-producer-dashboard"]').isVisible().catch(() => false);
    }, { timeout: 10000 }).toBe(true);
  });

  test('admin link NOT visible for producer', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-admin"]')).not.toBeVisible();
  });

  test('My Orders link NOT visible for producer (has dashboard instead)', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-my-orders"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Admin Role @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');

    // Wait for login form to be ready and hydration to complete
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Wait for React hydration to stabilize before interacting
    await page.waitForTimeout(500);

    // Use locator-based fill which handles re-attaching elements
    await emailInput.fill('admin@example.com');
    await page.locator('[name="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect
    await page.waitForURL(/\/|\/admin/, { timeout: 15000 }).catch(() => {});
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('admin link is visible', async ({ page }) => {
    await expect.poll(async () => {
      return await page.locator('[data-testid="nav-admin"]').isVisible().catch(() => false);
    }, { timeout: 10000 }).toBe(true);
  });

  test('producer dashboard link NOT visible for admin', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-producer-dashboard"]')).not.toBeVisible();
  });

  test('My Orders link NOT visible for admin', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-my-orders"]')).not.toBeVisible();
  });
});

test.describe('Header Navigation - Mobile Menu @smoke', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

  test.beforeEach(async ({ page, context }) => {
    // Ensure clean state - no auth
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
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
  });

  test('mobile menu opens and shows navigation items', async ({ page }) => {
    // Click hamburger menu
    await page.locator('[data-testid="mobile-menu-button"]').click();

    // Menu should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Should show mobile login link
    await expect(page.locator('[data-testid="mobile-nav-login"]')).toBeVisible();

    // Should show mobile register link
    await expect(page.locator('[data-testid="mobile-nav-register"]')).toBeVisible();
  });

  test('logo is visible on mobile (guest)', async ({ page }) => {
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible();
  });

  test('logo is visible on mobile with mock auth (UI-HEADER-NAV-03)', async ({ page }) => {
    // This is a regression test for the bug where logo was hidden on mobile when logged in.
    // The logo had width:0, height:0 due to flex layout issues when NotificationBell renders.
    // Fix: Added flex-shrink-0 to logo Link to prevent collapse.
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('user_role', 'consumer');
      localStorage.setItem('user_name', 'E2E Test Consumer');
      localStorage.setItem('e2e_mode', 'true');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible({ timeout: 10000 });

    // Also verify it has non-zero dimensions
    const boundingBox = await logo.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });
});
