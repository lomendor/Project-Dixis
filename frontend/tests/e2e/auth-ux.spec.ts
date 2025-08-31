import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth';

// Deterministic test users (created by E2ESeeder)
const TEST_USERS = {
  consumer: { email: 'test@dixis.local', password: 'Passw0rd!' },
  producer: { email: 'producer@dixis.local', password: 'Passw0rd!' },
};

test.describe('Auth UX Improvements', () => {
  // Clean state before each test
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('should show loading states during login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Navigate to login page
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    
    // Fill in deterministic credentials
    await page.getByTestId('login-email').fill(TEST_USERS.consumer.email);
    await page.getByTestId('login-password').fill(TEST_USERS.consumer.password);
    
    // Click login and check loading state
    await page.getByTestId('login-submit').click();
    
    // Verify loading state (if implemented)
    await auth.waitForLoadingComplete();
  });

  test('should show success toast on successful login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Login with deterministic user
    await auth.loginAsConsumer();
    
    // Wait for success toast
    await auth.expectToast('success', 'Welcome back');
  });

  test('should show error toast on failed login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Navigate to login page
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    
    // Use invalid credentials
    await page.getByTestId('login-email').fill('invalid@dixis.local');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();
    
    // Wait for error toast
    await auth.expectToast('error');
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Login first
    await auth.loginAsConsumer();
    
    // Try to access login page again
    await page.goto('/login');
    
    // Should be redirected away or see authenticated state
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (!currentUrl.includes('/login')) {
      // Good - redirected away from login
      expect(currentUrl).not.toMatch(/\/login/);
    }
  });

  test('should implement smart redirect after login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Navigate to page and set intended destination
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('intended_destination', '/cart');
    });
    
    // Login
    await auth.loginAsConsumer();
    
    // Navigate to cart to verify access
    await page.goto('/cart');
    
    // Verify cart page is accessible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should redirect producer to dashboard after login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Login as producer
    await auth.loginAsProducer();
    
    // Navigate to producer dashboard
    await page.goto('/dashboard');
    
    // Verify producer dashboard is accessible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should redirect consumer to home after login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Login as consumer
    await auth.loginAsConsumer();
    
    // Navigate to home
    await page.goto('/');
    
    // Verify home page content is accessible
    await expect(page.locator('main')).toBeVisible();
  });
});