import { test, expect } from '@playwright/test';

/**
 * Header Navigation E2E Tests
 *
 * Validates header/navbar behavior per docs/PRODUCT/HEADER-NAV-V1.md
 * - Logo always visible
 * - No dev/test links (Απαγορεύεται / Forbidden)
 * - Correct items by auth state and role
 */

test.describe('Header Navigation - Guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('logo is visible and links to home', async ({ page }) => {
    const logo = page.locator('[data-testid="nav-logo"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('guest nav shows correct items', async ({ page }) => {
    // Should show Products link
    await expect(page.locator('header').getByRole('link', { name: /προϊόντα|products/i })).toBeVisible();

    // Should show Track Order link
    await expect(page.locator('header').getByRole('link', { name: /παρακολούθηση|track/i })).toBeVisible();

    // Should show Producers link
    await expect(page.locator('header').getByRole('link', { name: /παραγωγοί|producers/i })).toBeVisible();

    // Should show Login link
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();

    // Should show Register link
    await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();
  });

  test('Απαγορεύεται / Forbidden link is NOT visible', async ({ page }) => {
    // This link should never appear in the nav
    const forbiddenLink = page.locator('header').getByRole('link', { name: /απαγορεύεται|forbidden/i });
    await expect(forbiddenLink).not.toBeVisible();
  });

  test('language toggle is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="lang-el"]')).toBeVisible();
    await expect(page.locator('[data-testid="lang-en"]')).toBeVisible();
  });
});

test.describe('Header Navigation - Logged-in Consumer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as consumer
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'consumer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await page.waitForURL('/', { timeout: 15000 }).catch(() => {
      // If we're already logged in or redirected elsewhere, continue
    });

    await page.goto('/');
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
    await expect(page.locator('[data-testid="nav-my-orders"]')).toBeVisible();
  });

  test('logout button is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="logout-btn"]')).toBeVisible();
  });

  test('Απαγορεύεται / Forbidden link is NOT visible when logged in', async ({ page }) => {
    const forbiddenLink = page.locator('header').getByRole('link', { name: /απαγορεύεται|forbidden/i });
    await expect(forbiddenLink).not.toBeVisible();
  });
});

test.describe('Header Navigation - Producer Role', () => {
  test.beforeEach(async ({ page }) => {
    // Login as producer
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'producer@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/|\/producer/, { timeout: 15000 }).catch(() => {});

    await page.goto('/');
  });

  test('producer dashboard link is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-producer-dashboard"]')).toBeVisible();
  });
});

test.describe('Header Navigation - Admin Role', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/|\/admin/, { timeout: 15000 }).catch(() => {});

    await page.goto('/');
  });

  test('admin link is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="nav-admin"]')).toBeVisible();
  });
});
