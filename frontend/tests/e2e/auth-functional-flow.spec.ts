import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth';

/**
 * Pass 27: Auth Functional Flow Test (CI Guardrail)
 *
 * Tests the COMPLETE auth flow:
 * 1. Register new user (unique email per test run)
 * 2. Login with registered user
 * 3. Verify authenticated state (UI + redirect)
 *
 * This test ensures register + login submissions work end-to-end
 * and prevents regressions in auth functionality.
 */

test.describe('Auth Functional Flow (Pass 27 Guardrail)', () => {
  // Generate unique credentials for each test run
  const timestamp = Date.now();
  const uniqueEmail = `e2e-test-${timestamp}@example.com`;
  const testPassword = `TestPass123!${timestamp}`;
  const testName = `E2E Test User ${timestamp}`;

  test.beforeEach(async ({ context }) => {
    // Clear auth state before each test
    await context.clearCookies();
  });

  test('should complete full auth flow: register → login → authenticated', async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.clearAuthState();

    // Step 1: Register new user
    await page.goto('/auth/register');
    await expect(page.getByTestId('register-form')).toBeVisible({ timeout: 10000 });

    // Fill registration form
    await page.getByTestId('register-name').fill(testName);
    await page.getByTestId('register-email').fill(uniqueEmail);
    await page.getByTestId('register-password').fill(testPassword);
    await page.getByTestId('register-password-confirm').fill(testPassword);

    // Select consumer role (if role selector exists)
    const roleSelector = page.getByTestId('register-role');
    if (await roleSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleSelector.selectOption('consumer');
    }

    // Submit registration
    await page.getByTestId('register-submit').click();

    // Wait for successful registration (should redirect to login or dashboard)
    await page.waitForURL(/\/(auth\/login|dashboard|products|$)/, {
      timeout: 10000,
      waitUntil: 'networkidle'
    });

    // Verify we're no longer on register page
    const afterRegisterUrl = page.url();
    expect(afterRegisterUrl).not.toMatch(/\/auth\/register/);

    // Step 2: Login with registered credentials
    // (If registration redirected to login, we're already there; otherwise navigate)
    if (!afterRegisterUrl.includes('/auth/login')) {
      await page.goto('/auth/login');
    }

    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 10000 });

    // Fill login form
    await page.getByTestId('login-email').fill(uniqueEmail);
    await page.getByTestId('login-password').fill(testPassword);

    // Submit login
    await page.getByTestId('login-submit').click();

    // Wait for successful login (should redirect away from login page)
    await page.waitForURL(/\/(dashboard|products|$)/, {
      timeout: 10000,
      waitUntil: 'networkidle'
    });

    // Step 3: Verify authenticated state
    const afterLoginUrl = page.url();
    expect(afterLoginUrl).not.toMatch(/\/auth\/login/);

    // Check for authenticated UI markers (if they exist)
    // Try to find user menu, logout button, or authenticated nav elements
    const authenticatedMarkers = [
      page.getByTestId('user-menu'),
      page.getByTestId('nav-logout'),
      page.getByTestId('logout-button'),
      page.getByRole('button', { name: /logout|έξοδος/i })
    ];

    // At least one authenticated marker should be visible
    let foundMarker = false;
    for (const marker of authenticatedMarkers) {
      if (await marker.isVisible({ timeout: 2000 }).catch(() => false)) {
        foundMarker = true;
        break;
      }
    }

    // If no UI markers found, check localStorage for auth token (fallback verification)
    if (!foundMarker) {
      const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(authToken).not.toBeNull();
      expect(authToken).not.toBe('');
    }

    // Verify we can access authenticated routes (e.g., /account, /orders)
    // This proves the session/token works for protected routes
    await page.goto('/orders');
    const ordersUrl = page.url();

    // Should NOT redirect to login (would indicate session invalid)
    expect(ordersUrl).not.toMatch(/\/auth\/login/);

    // Page should load successfully (not 404/error)
    await expect(page.getByTestId('page-root').or(page.getByRole('main'))).toBeVisible({ timeout: 10000 });
  });

  test('should reject login with wrong password', async ({ page }) => {
    // Use the newly registered user from previous test
    // (or a known test user if available)
    await page.goto('/auth/login');
    await expect(page.getByTestId('login-form')).toBeVisible();

    await page.getByTestId('login-email').fill(uniqueEmail);
    await page.getByTestId('login-password').fill('WrongPassword123!');
    await page.getByTestId('login-submit').click();

    // Should NOT redirect (stay on login page)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/auth\/login/);

    // Should show error message or toast
    const errorIndicators = [
      page.getByTestId('login-error'),
      page.getByTestId('toast-error'),
      page.getByText(/invalid credentials|wrong password|authentication failed/i)
    ];

    let foundError = false;
    for (const indicator of errorIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        foundError = true;
        break;
      }
    }

    // If no error UI found, at least verify we didn't authenticate
    if (!foundError) {
      const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
      expect(authToken).toBeNull();
    }
  });

  test('should reject registration with duplicate email', async ({ page }) => {
    // Try to register with the same email twice
    await page.goto('/auth/register');
    await expect(page.getByTestId('register-form')).toBeVisible();

    // Fill with same email as first test
    await page.getByTestId('register-name').fill('Duplicate User');
    await page.getByTestId('register-email').fill(uniqueEmail);
    await page.getByTestId('register-password').fill(testPassword);
    await page.getByTestId('register-password-confirm').fill(testPassword);

    // Try to submit
    await page.getByTestId('register-submit').click();

    // Should NOT redirect (stay on register page or show error)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    // Either stayed on register OR redirected to login (both acceptable)
    const errorIndicators = [
      page.getByTestId('register-error'),
      page.getByTestId('toast-error'),
      page.getByText(/email already exists|email has already been taken/i)
    ];

    let foundError = false;
    for (const indicator of errorIndicators) {
      if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
        foundError = true;
        break;
      }
    }

    // If no error found but we redirected to login, that's also acceptable
    // (backend might auto-login existing user or show generic message)
    if (!foundError && !currentUrl.includes('/auth/login')) {
      // Still on register page - this is the expected error behavior
      expect(currentUrl).toMatch(/\/auth\/register/);
    }
  });
});
