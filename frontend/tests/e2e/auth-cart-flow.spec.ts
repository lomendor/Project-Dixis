import { test, expect } from '@playwright/test';
import './setup.mocks';

/**
 * Auth-Cart Flow Tests
 *
 * Tests cart icon visibility and behavior for different user roles.
 *
 * Cart visibility rules:
 * - Guest: visible (nav-cart-guest)
 * - Consumer: visible (nav-cart)
 * - Admin: visible (nav-cart-admin)
 * - Producer: HIDDEN (returns null)
 */

const setupPage = async (page: any) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('page-root').or(page.getByTestId('error-boundary')).first().waitFor({ timeout: 15000 });
};

const setupAuthState = async (page: any, role: 'consumer' | 'producer' | 'admin') => {
  await page.evaluate((r: string) => {
    localStorage.setItem('auth_token', 'mock_token');
    localStorage.setItem('user_id', '1');
    localStorage.setItem('user_role', r);
    localStorage.setItem('user_name', 'Test User');
    localStorage.setItem('e2e_mode', 'true');
  }, role);
};

test.describe('Auth-Cart Flow Tests', () => {
  test('Guest users see cart icon', async ({ page }) => {
    // Clear any auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await setupPage(page);

    // Guest cart should be visible
    const guestCart = page.getByTestId('nav-cart-guest').first();
    await expect(guestCart).toBeVisible();
  });

  test('Consumer users see cart icon', async ({ page }) => {
    await page.goto('/');
    await setupAuthState(page, 'consumer');
    await page.reload();
    await setupPage(page);

    // Consumer cart should be visible
    const consumerCart = page.getByTestId('nav-cart').first();
    await expect(consumerCart).toBeVisible();
  });

  test('Producer users do not see cart icon', async ({ page }) => {
    await page.goto('/');
    await setupAuthState(page, 'producer');
    await page.reload();
    await setupPage(page);

    // Cart is completely hidden for producers (returns null)
    const guestCart = page.getByTestId('nav-cart-guest');
    const consumerCart = page.getByTestId('nav-cart');
    const adminCart = page.getByTestId('nav-cart-admin');

    await expect(guestCart).not.toBeVisible();
    await expect(consumerCart).not.toBeVisible();
    await expect(adminCart).not.toBeVisible();
  });

  test('Admin users see cart icon', async ({ page }) => {
    await page.goto('/');
    await setupAuthState(page, 'admin');
    await page.reload();
    await setupPage(page);

    // Admin cart should be visible
    const adminCart = page.getByTestId('nav-cart-admin').first();
    await expect(adminCart).toBeVisible();
  });

  test('Mobile navigation shows cart for guest', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Clear any auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await setupPage(page);

    // Mobile cart should be visible for guest
    const mobileCart = page.getByTestId('mobile-nav-cart-guest');
    await expect(mobileCart).toBeVisible();
  });
});
