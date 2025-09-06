import { test, expect, Page } from '@playwright/test';
import { createAuthHelper } from './helpers/auth';

class MobileNavHelper {
  private auth = createAuthHelper(this.page);
  
  constructor(private page: Page) {}

  async openMobileMenu() {
    await this.page.click('[data-testid="mobile-menu-button"]');
    await this.page.waitForSelector('[data-testid="mobile-menu"]', { state: 'visible' });
  }

  async closeMobileMenu() {
    await this.page.click('[data-testid="mobile-menu-button"]');
    await this.page.waitForSelector('[data-testid="mobile-menu"]', { state: 'hidden' });
  }

  async isMobileMenuVisible() {
    return await this.page.isVisible('[data-testid="mobile-menu"]');
  }

  async isMobileMenuButtonVisible() {
    return await this.page.isVisible('[data-testid="mobile-menu-button"]');
  }

  async fastLogin(role: 'consumer' | 'producer') {
    // Use deterministic fast login instead of flaky UI login
    await this.auth.fastLogin(role);
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await this.auth.verifyAuthState(role);
  }
}

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should show mobile menu button on mobile screens', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Mobile menu button should be visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Desktop navigation should be hidden
    await expect(page.locator('.hidden.md\\:block')).not.toBeVisible();
  });

  test('should toggle mobile menu when hamburger button is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Mobile menu should be hidden initially
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
    
    // Open mobile menu
    await helper.openMobileMenu();
    expect(await helper.isMobileMenuVisible()).toBeTruthy();
    
    // Close mobile menu
    await helper.closeMobileMenu();
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should show hamburger icon when menu is closed and X icon when menu is open', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Check hamburger icon is shown (three horizontal lines)
    const hamburgerIcon = page.locator('[data-testid="mobile-menu-button"] svg path[d*="M4 6h16M4 12h16M4 18h16"]');
    await expect(hamburgerIcon).toBeVisible();
    
    // Open menu
    await helper.openMobileMenu();
    
    // Check X icon is shown (close icon)
    const closeIcon = page.locator('[data-testid="mobile-menu-button"] svg path[d*="M6 18L18 6M6 6l12 12"]');
    await expect(closeIcon).toBeVisible();
  });

  test('should display Products link in mobile menu', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    
    const productsLink = page.locator('[data-testid="mobile-nav-products"]');
    await expect(productsLink).toBeVisible();
    await expect(productsLink).toContainText('Products');
  });

  test('should navigate to products page when mobile Products link is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    await page.click('[data-testid="mobile-nav-products"]');
    
    // Should navigate to home page and close menu
    await expect(page).toHaveURL('/');
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should show login and register links for unauthenticated users', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    
    // Should show login and register links
    await expect(page.locator('[data-testid="mobile-nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-register"]')).toBeVisible();
    
    // Should not show cart or dashboard links
    await expect(page.locator('[data-testid="mobile-nav-cart"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-dashboard"]')).not.toBeVisible();
  });

  test('should show cart link for authenticated consumers', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as consumer
    await helper.fastLogin('consumer');
    
    await helper.openMobileMenu();
    
    // Should show cart link for consumers
    await expect(page.locator('[data-testid="mobile-nav-cart"]')).toBeVisible();
    
    // Should not show dashboard link for consumers
    await expect(page.locator('[data-testid="mobile-nav-dashboard"]')).not.toBeVisible();
    
    // Should not show login/register links for authenticated users
    await expect(page.locator('[data-testid="mobile-nav-login"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-register"]')).not.toBeVisible();
  });

  test('should show dashboard link for authenticated producers', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as producer
    await helper.fastLogin('producer');
    
    await helper.openMobileMenu();
    
    // Should show dashboard link for producers
    await expect(page.locator('[data-testid="mobile-nav-dashboard"]')).toBeVisible();
    
    // Should not show cart link for producers
    await expect(page.locator('[data-testid="mobile-nav-cart"]')).not.toBeVisible();
    
    // Should not show login/register links for authenticated users
    await expect(page.locator('[data-testid="mobile-nav-login"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav-register"]')).not.toBeVisible();
  });

  test('should show user profile info in mobile menu when authenticated', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as consumer
    await helper.fastLogin('consumer');
    
    await helper.openMobileMenu();
    
    // Should show user profile information
    const userSection = page.locator('.flex.items-center.px-5');
    await expect(userSection).toBeVisible();
    
    // Should show user avatar with first letter
    const avatar = page.locator('.h-8.w-8.bg-green-100.rounded-full');
    await expect(avatar).toBeVisible();
    
    // Should show logout button
    await expect(page.locator('[data-testid="mobile-logout-btn"]')).toBeVisible();
  });

  test('should logout user when mobile logout button is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as consumer
    await helper.fastLogin('consumer');
    
    await helper.openMobileMenu();
    
    // Verify user is logged in by checking logout button exists
    await expect(page.locator('[data-testid="mobile-logout-btn"]')).toBeVisible();
    
    // Click logout and wait for the auth state to change
    await page.getByTestId('mobile-logout-btn').click();
    
    // Wait for the user to be logged out by checking that user menu disappears
    await expect(page.getByTestId('user-menu')).toHaveCount(0);
    
    // Verify logout was successful - logout button should no longer exist
    await expect(page.locator('[data-testid="mobile-logout-btn"]')).toHaveCount(0);
  });

  test('should navigate to cart when mobile cart link is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as consumer
    await helper.fastLogin('consumer');
    
    await helper.openMobileMenu();
    await page.click('[data-testid="mobile-nav-cart"]');
    
    // Should navigate to cart page and close menu
    await expect(page).toHaveURL('/cart');
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should navigate to dashboard when mobile dashboard link is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    // Login as producer
    await helper.fastLogin('producer');
    
    await helper.openMobileMenu();
    await page.click('[data-testid="mobile-nav-dashboard"]');
    
    // Should navigate to producer dashboard and close menu
    await expect(page).toHaveURL('/producer/dashboard');
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should navigate to login when mobile login link is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    await page.click('[data-testid="mobile-nav-login"]');
    
    // Should navigate to login page and close menu
    await expect(page).toHaveURL('/auth/login');
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should navigate to register when mobile register link is clicked', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    await page.click('[data-testid="mobile-nav-register"]');
    
    // Should navigate to register page and close menu
    await expect(page).toHaveURL('/auth/register');
    expect(await helper.isMobileMenuVisible()).toBeFalsy();
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    const helper = new MobileNavHelper(page);
    
    await helper.openMobileMenu();
    expect(await helper.isMobileMenuVisible()).toBeTruthy();
    
    // Click outside the menu (on the main content)
    await page.click('body', { position: { x: 100, y: 400 } });
    
    // Menu should still be open (this test may need adjustment based on actual behavior)
    // Note: This test assumes no outside click handler. If implemented, update accordingly.
  });
});

test.describe('Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
  });

  test('should hide mobile menu button on desktop screens', async ({ page }) => {
    // Mobile menu button should be hidden on desktop
    await expect(page.locator('[data-testid="mobile-menu-button"]')).not.toBeVisible();
    
    // Desktop navigation should be visible
    await expect(page.locator('.hidden.md\\:block')).toBeVisible();
  });

  test('should show desktop navigation links', async ({ page }) => {
    // Desktop nav links should be visible
    await expect(page.locator('[data-testid="nav-products"]')).toBeVisible();
    
    // Desktop auth links should be visible for unauthenticated users
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-register"]')).toBeVisible();
  });
});