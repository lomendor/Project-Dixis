import { test, expect } from '@playwright/test';
import './setup.mocks';

/**
 * Auth-Cart Flow E2E Tests
 * Tests cart behavior across different user roles (guest, consumer, producer)
 */

test.describe('Auth-Cart Flow Tests', () => {
  
  test('Guest users see login prompt for cart access', async ({ page }) => {
    // Navigate as guest (no auth token)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for main content or error page to load (same pattern as smoke tests)
    await Promise.race([
      page.getByTestId('page-root').waitFor({ timeout: 15000 }).catch(() => {}), 
      page.getByTestId('error-boundary').waitFor({ timeout: 15000 }).catch(() => {})
    ]);
    await page.waitForTimeout(1000);
    
    // Guest should see login prompt instead of cart
    const cartLoginPrompt = page.getByTestId('cart-login-prompt');
    await expect(cartLoginPrompt).toBeVisible();
    await expect(cartLoginPrompt).toHaveText('Login to Add to Cart');
    
    // Clicking cart prompt should redirect to login
    await cartLoginPrompt.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('Consumer users see active cart with item count', async ({ page, context }) => {
    // Set consumer auth state
    await context.addCookies([
      { name: 'auth_token', value: 'consumer_token', domain: '127.0.0.1', path: '/' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'consumer_token');
      localStorage.setItem('user_role', 'consumer');
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await Promise.race([page.getByTestId('page-root').waitFor().catch(() => {}), page.getByTestId('error-boundary').waitFor().catch(() => {})]);
    await page.waitForTimeout(1000);
    
    // Consumer should see active cart icon
    const activeCartIcon = page.getByTestId('cart-icon-active');
    await expect(activeCartIcon).toBeVisible();
    
    // Should show item count badge
    const itemCount = page.getByTestId('cart-item-count');
    await expect(itemCount).toBeVisible();
    await expect(itemCount).toHaveText('3'); // Mock count from CartIcon
    
    // Clicking should navigate to cart page
    await activeCartIcon.click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('Producer users see limited cart access message', async ({ page, context }) => {
    // Set producer auth state  
    await context.addCookies([
      { name: 'auth_token', value: 'producer_token', domain: '127.0.0.1', path: '/' }
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'producer_token');
      localStorage.setItem('user_role', 'producer');
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await Promise.race([page.getByTestId('page-root').waitFor().catch(() => {}), page.getByTestId('error-boundary').waitFor().catch(() => {})]);
    await page.waitForTimeout(1000);
    
    // Producer should see limited cart access
    const producerCartMode = page.getByTestId('cart-producer-mode');
    await expect(producerCartMode).toBeVisible();
    
    const producerMessage = page.getByTestId('cart-producer-message');
    await expect(producerMessage).toBeVisible();
    await expect(producerMessage).toHaveText('Producer Cart View');
  });

  test('Mobile navigation shows correct cart behavior for all roles', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Test guest mobile cart
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await Promise.race([page.getByTestId('page-root').waitFor().catch(() => {}), page.getByTestId('error-boundary').waitFor().catch(() => {})]);
    await page.waitForTimeout(1000);
    
    // Open mobile menu
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await mobileMenuButton.click();
    await page.waitForSelector('[data-testid="mobile-menu"]');
    
    // Guest should see login prompt in mobile menu
    const mobileCartPrompt = page.getByTestId('cart-login-prompt');
    await expect(mobileCartPrompt).toBeVisible();
    await expect(mobileCartPrompt).toHaveText('Login to Add to Cart');
  });

  test('Role transition updates cart display correctly', async ({ page, context }) => {
    // Start as guest
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await Promise.race([page.getByTestId('page-root').waitFor().catch(() => {}), page.getByTestId('error-boundary').waitFor().catch(() => {})]);
    await page.waitForTimeout(1000);
    
    // Verify guest state
    await expect(page.getByTestId('cart-login-prompt')).toBeVisible();
    
    // Simulate login as consumer (inject auth state)
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'consumer_token'); 
      localStorage.setItem('user_role', 'consumer');
    });
    await page.reload();
    await page.waitForSelector('[data-testid="page-root"]', { timeout: 15000 });
    
    // Should now show active cart
    await expect(page.getByTestId('cart-icon-active')).toBeVisible();
    await expect(page.getByTestId('cart-item-count')).toBeVisible();
  });
});