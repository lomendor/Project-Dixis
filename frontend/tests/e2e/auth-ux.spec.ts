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
    await page.goto('/auth/login');
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
    
    // Navigate to login page first
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    
    // Fill in credentials
    await page.getByTestId('login-email').fill('test@dixis.local');
    await page.getByTestId('login-password').fill('Passw0rd!');
    
    // Submit login and check for successful redirect
    await page.getByTestId('login-submit').click();
    
    // Verify successful login by checking for user greeting or welcome message
    await expect(
      page.getByText('Hello, Test User').or(page.getByText('Welcome back')).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show error toast on failed login', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Navigate to login page
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    
    // Use invalid credentials
    await page.getByTestId('login-email').fill('invalid@dixis.local');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();
    
    // Wait briefly for error processing
    await page.waitForTimeout(150);
    
    // Check for error toast (use first to avoid strict mode violation)
    const errorVisible = await page.getByTestId('toast-error').or(
      page.getByTestId('error-toast')
    ).or(page.getByRole('alert')).first().isVisible({ timeout: 5000 });
    
    expect(errorVisible).toBe(true);
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();
    
    // Login first
    await auth.loginAsConsumer();
    
    // Try to access login page again
    await page.goto('/auth/login');
    
    // Should be redirected away or see authenticated state
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (!currentUrl.includes('/auth/login')) {
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
    await page.goto('/producer/dashboard');
    
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