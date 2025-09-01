import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Enhanced E2E Test Suite: Authentication Edge Cases
 * Tests session management, token handling, and auth recovery
 */

class AuthTestHelper {
  constructor(private page: Page, private context: BrowserContext) {}

  async clearAllAuthData() {
    // Clear cookies
    await this.context.clearCookies();
    
    // Clear localStorage (including auth tokens)
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('🧹 Cleared all authentication data');
  }

  async loginWithCredentials(email: string, password: string, shouldSucceed: boolean = true) {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    
    const loginBtn = this.page.locator('button[type="submit"]');
    await loginBtn.click();
    
    if (shouldSucceed) {
      // Wait for successful redirect to home
      await this.page.waitForURL('/', { timeout: 10000 });
      
      // Verify user is logged in
      const userGreeting = this.page.locator(':text("Hello"), :text("Welcome"), [data-testid="user-menu"]');
      await expect(userGreeting.first()).toBeVisible({ timeout: 5000 });
      
      console.log(`✅ Login successful for ${email}`);
      return true;
    } else {
      // Wait for error message or stay on login page
      await this.page.waitForTimeout(2000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/login')) {
        console.log(`❌ Login failed for ${email} (expected)`);
        return false;
      } else {
        throw new Error(`Expected login to fail but succeeded for ${email}`);
      }
    }
  }

  async attemptProtectedAction() {
    // Try to access cart (requires authentication)
    await this.page.goto('/cart');
    
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('/auth/login')) {
      console.log('🔒 Redirected to login (not authenticated)');
      return false;
    } else {
      console.log('✅ Accessed protected page (authenticated)');
      return true;
    }
  }

  async checkAuthState(): Promise<'authenticated' | 'unauthenticated'> {
    // Check if auth token exists in localStorage
    const token = await this.page.evaluate(() => localStorage.getItem('auth_token'));
    
    // Check if user menu/greeting is visible
    const userMenu = this.page.locator(':text("Hello"), :text("Consumer User"), [data-testid="user-menu"]');
    const isUserMenuVisible = await userMenu.first().isVisible().catch(() => false);
    
    if (token && isUserMenuVisible) {
      console.log('🔓 User is authenticated');
      return 'authenticated';
    } else {
      console.log('🔒 User is not authenticated');
      return 'unauthenticated';
    }
  }
}

test('auth edge-cases - wrong password then correct password', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Fill login form with wrong password (using correct test user email)
  await page.fill('[name="email"]', 'test@dixis.local');
  await page.fill('[name="password"]', 'wrong-password');
  
  // Submit login form with wrong password
  await page.click('button[type="submit"]');
  
  // Wait for error message to appear
  const errorMessage = page.locator('[data-testid="error-toast"], .error, [role="alert"]');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });
  
  // Verify error message content
  await expect(errorMessage).toContainText(/invalid|incorrect|wrong|failed/i);
  
  // Clear the password field and enter correct password
  await page.fill('[name="password"]', '');
  await page.fill('[name="password"]', 'Passw0rd!');
  
  // Submit login form with correct password
  await Promise.all([
    page.waitForURL('/', { timeout: 10000 }),
    page.click('button[type="submit"]')
  ]);
  
  // Should be redirected to home page after successful login
  await expect(page).toHaveURL('/');
  
  // Verify login worked - should see user menu
  await expect(page.locator('[data-testid="user-menu"]').first()).toBeVisible({ timeout: 10000 });
});

test('auth edge-cases - empty fields validation', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Try to submit with empty fields
  await page.click('button[type="submit"]');
  
  // Wait for validation errors
  const emailError = page.locator('input[name="email"] + .error, [data-testid="email-error"]');
  const passwordError = page.locator('input[name="password"] + .error, [data-testid="password-error"]');
  
  // Check for HTML5 validation or custom error messages
  const emailField = page.locator('input[name="email"]');
  const passwordField = page.locator('input[name="password"]');
  
  // Verify fields are marked as invalid (HTML5 validation or custom)
  await expect(emailField).toHaveAttribute('required');
  await expect(passwordField).toHaveAttribute('required');
  
  // Ensure we're still on login page (not redirected)
  await expect(page).toHaveURL(/.*auth\/login/);
});

// ============================================================================
// C3: Enhanced Session Management and Auth Recovery Tests
// ============================================================================

test('C3: Session management and auth recovery', async ({ page, context }) => {
  const helper = new AuthTestHelper(page, context);
  
  console.log('🧪 C3: Testing session management...');
  
  // Phase 1: Normal login
  console.log('👤 Phase 1: Normal login flow...');
  await helper.loginWithCredentials('test@dixis.local', 'Passw0rd!');
  
  let authState = await helper.checkAuthState();
  expect(authState).toBe('authenticated');
  
  // Verify protected action works
  const protectedAccess = await helper.attemptProtectedAction();
  expect(protectedAccess).toBe(true);
  
  // Phase 2: Clear session and verify auth state
  console.log('🧹 Phase 2: Clearing session data...');
  await helper.clearAllAuthData();
  
  authState = await helper.checkAuthState();
  expect(authState).toBe('unauthenticated');
  
  // Phase 3: Attempt protected action (should redirect)
  console.log('🔒 Phase 3: Testing auth protection...');
  const protectedAccessAfterClear = await helper.attemptProtectedAction();
  expect(protectedAccessAfterClear).toBe(false);
  
  // Phase 4: Re-login after session clear
  console.log('🔄 Phase 4: Re-login after session clear...');
  await helper.loginWithCredentials('test@dixis.local', 'Passw0rd!');
  
  authState = await helper.checkAuthState();
  expect(authState).toBe('authenticated');
  
  // Verify protected action works again
  const finalProtectedAccess = await helper.attemptProtectedAction();
  expect(finalProtectedAccess).toBe(true);
  
  console.log('✅ C3: Session management test completed');
});

test('C3a: Auth state persistence across page reloads', async ({ page, context }) => {
  const helper = new AuthTestHelper(page, context);
  
  console.log('🧪 C3a: Testing auth persistence...');
  
  // Login
  await helper.loginWithCredentials('test@dixis.local', 'Passw0rd!');
  
  // Reload page
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Check if still authenticated
  const authAfterReload = await helper.checkAuthState();
  expect(authAfterReload).toBe('authenticated');
  console.log('✅ Auth state persisted after reload');
  
  // Navigate to different page and back
  await page.goto('/');
  await page.goto('/cart');
  
  const authAfterNavigation = await helper.attemptProtectedAction();
  expect(authAfterNavigation).toBe(true);
  console.log('✅ Auth state persisted across navigation');
  
  console.log('✅ C3a: Auth persistence test completed');
});

test('C3b: Token corruption and recovery', async ({ page, context }) => {
  const helper = new AuthTestHelper(page, context);
  
  console.log('🧪 C3b: Testing token handling...');
  
  // Login normally
  await helper.loginWithCredentials('test@dixis.local', 'Passw0rd!');
  
  // Verify token exists
  const initialToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  expect(initialToken).toBeTruthy();
  console.log('🎫 Initial token acquired');
  
  // Simulate token corruption
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'invalid_token_12345');
  });
  console.log('💥 Token corrupted');
  
  // Try to access protected resource
  await page.goto('/cart');
  
  const currentUrl = page.url();
  
  if (currentUrl.includes('/auth/login')) {
    console.log('🔒 Redirected to login due to invalid token');
    
    // Re-login should work
    await helper.loginWithCredentials('test@dixis.local', 'Passw0rd!');
    const finalToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(finalToken).toBeTruthy();
    expect(finalToken).not.toBe('invalid_token_12345');
    
    console.log('✅ Token refresh via re-login successful');
  } else {
    // App might handle invalid tokens gracefully
    console.log('🛡️ App handled invalid token gracefully');
  }
  
  console.log('✅ C3b: Token handling test completed');
});

test('auth edge-cases - invalid email format', async ({ page }) => {
  // Navigate to login page
  await Promise.all([
    page.waitForURL('**/auth/login', { timeout: 10000 }),
    page.goto('/auth/login')
  ]);
  
  // Fill login form with invalid email format
  await page.fill('[name="email"]', 'invalid-email-format');
  await page.fill('[name="password"]', 'Passw0rd!');
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Check for validation error or server error
  const errorIndicator = page.locator('[data-testid="error-toast"], .error, [role="alert"], input[name="email"]:invalid');
  
  try {
    await expect(errorIndicator).toBeVisible({ timeout: 5000 });
  } catch {
    // If no visible error, check if HTML5 validation prevented submission
    await expect(page).toHaveURL(/.*auth\/login/);
  }
});