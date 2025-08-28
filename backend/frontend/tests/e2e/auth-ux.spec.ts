import { test, expect, Page } from '@playwright/test';

class AuthE2EHelper {
  constructor(private page: Page) {}

  async navigateAndWait(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForToast(type: 'success' | 'error' | 'info' | 'warning') {
    // Wait for toast container to be present (existence check)
    await this.page.waitForSelector('[data-testid="toast-container"]', { state: 'attached', timeout: 10000 });
    
    // Wait for specific toast type to be attached to DOM
    const toastSelector = `[data-testid="toast-${type}"]`;
    await this.page.waitForSelector(toastSelector, { state: 'attached', timeout: 10000 });
    return this.page.locator(toastSelector).first();
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    
    // Click login button and wait for success
    await this.page.click('button[type="submit"]');
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'producer';
  }) {
    await this.page.fill('[name="name"]', userData.name);
    await this.page.fill('[name="email"]', userData.email);
    await this.page.selectOption('[name="role"]', userData.role);
    await this.page.fill('[name="password"]', userData.password);
    await this.page.fill('[name="password_confirmation"]', userData.password);
    
    // Click register button
    await this.page.click('button[type="submit"]');
  }
}

test.describe('Auth UX Improvements', () => {
  test('should show loading states during login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/login');
    
    // Fill in credentials
    await helper.login('consumer@example.com', 'password');
    
    // Verify loading state appears
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('button:has-text("Signing in...")')).toBeVisible();
  });

  test('should show success toast on successful login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('consumer@example.com', 'password');
    
    // Wait for success toast
    const successToast = await helper.waitForToast('success');
    await expect(successToast).toContainText('Welcome back');
  });

  test('should show error toast on failed login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('invalid@example.com', 'wrongpassword');
    
    // Wait for error toast
    const errorToast = await helper.waitForToast('error');
    await expect(errorToast).toBeVisible();
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    // Login first
    await helper.navigateAndWait('/auth/login');
    await helper.login('consumer@example.com', 'password');
    
    // Wait for redirect to home
    await page.waitForURL('/', { timeout: 10000 });
    
    // Try to access login page again
    await helper.navigateAndWait('/auth/login');
    
    // Should be redirected away from login page
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page).not.toHaveURL('/auth/login');
  });

  test('should implement smart redirect after login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    // Try to access cart page without being logged in
    await helper.navigateAndWait('/cart');
    
    // Should be redirected to login (if AuthGuard is implemented on cart page)
    // For now, let's test the intended destination functionality manually
    
    // Set intended destination in sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('intended_destination', '/cart');
    });
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('consumer@example.com', 'password');
    
    // After login, should redirect to intended destination (cart)
    await page.waitForURL('/cart', { timeout: 10000 });
    await expect(page).toHaveURL('/cart');
  });

  test('should show loading states during registration', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/register');
    
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'consumer' as const,
    };
    
    // Fill form and submit
    await helper.register(userData);
    
    // Verify loading state appears
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('button:has-text("Creating Account...")')).toBeVisible();
  });

  test.skip('should show validation error toasts on register form', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/register');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Wait for validation error toast
    const errorToast = await helper.waitForToast('error');
    await expect(errorToast).toContainText('Please fill in all required fields');
  });

  test('should show password mismatch error toast', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/register');
    
    // Fill form with mismatched passwords
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="password_confirmation"]', 'differentpassword');
    
    await page.click('button[type="submit"]');
    
    // Wait for password mismatch error toast
    const errorToast = await helper.waitForToast('error');
    await expect(errorToast).toContainText('Passwords do not match');
  });

  test('should redirect producer to dashboard after login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('producer@example.com', 'password');
    
    // Producer should be redirected to producer dashboard
    await page.waitForURL('/producer/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/producer/dashboard');
  });

  test('should redirect consumer to home after login', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('consumer@example.com', 'password');
    
    // Consumer should be redirected to home
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test.skip('should clear intended destination after successful redirect', async ({ page }) => {
    const helper = new AuthE2EHelper(page);
    
    // Navigate to a page first to ensure DOM is ready
    await helper.navigateAndWait('/');
    
    // Set intended destination after page is loaded
    await page.evaluate(() => {
      sessionStorage.setItem('intended_destination', '/some-protected-route');
    });
    
    await helper.navigateAndWait('/auth/login');
    await helper.login('consumer@example.com', 'password');
    
    // Wait for redirect
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify intended destination was cleared
    const intendedDestination = await page.evaluate(() => {
      return sessionStorage.getItem('intended_destination');
    });
    
    expect(intendedDestination).toBeNull();
  });
});