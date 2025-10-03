import { Page } from '@playwright/test';
import { hasPreauth, waitForAuthState } from './auth-mode';

/**
 * Test-only authentication helper for E2E tests
 * Phase-4.1: Supports both storageState pre-auth and UI login flows
 */
export class TestAuthHelper {
  constructor(private page: Page) {}

  /**
   * Login using test-only endpoint
   * @param role - The role to login as: 'consumer', 'producer', or 'admin'
   */
  async testLogin(role: 'consumer' | 'producer' | 'admin' = 'consumer') {
    // Only use test login if E2E flag is enabled
    if (!process.env.NEXT_PUBLIC_E2E) {
      throw new Error('Test login requires NEXT_PUBLIC_E2E=true');
    }

    // Pass 37: NEXT_PUBLIC_API_BASE_URL is 'http://127.0.0.1:8001' (no /api/v1 suffix)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
    const testLoginUrl = `${baseUrl}/api/v1/test/login`;

    // Call test login endpoint
    const response = await this.page.request.post(testLoginUrl, {
      data: { role }
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Test login failed: ${response.status()} - ${error}`);
    }

    const result = await response.json();
    const { token, user } = result;

    // Store token in context for API calls
    await this.page.context().addCookies([
      {
        name: 'test_auth_token',
        value: token,
        domain: '127.0.0.1',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
      }
    ]);

    // Also store in localStorage for client-side API calls
    await this.page.evaluate(({ token, user }) => {
      localStorage.setItem('test_auth_token', token);
      localStorage.setItem('test_auth_user', JSON.stringify(user));
    }, { token, user });

    // Force page reload to ensure auth state is recognized by components
    await this.page.reload();
    await this.page.waitForLoadState('networkidle'); // Wait for API calls to complete

    // Navigate to home page after login
    await this.page.goto('/');

    // Wait for authenticated navigation to appear with improved fallback
    try {
      await this.page.waitForSelector('[data-testid="user-menu"], [data-testid="nav-user"]', {
        timeout: 5000,
        state: 'visible'
      });
    } catch {
      // Fallback: check if auth worked by looking for any logout/profile elements
      try {
        await this.page.waitForSelector('text=Logout, text=Sign Out, text=Profile', { timeout: 5000 });
      } catch {
        // Final fallback: just ensure we're not on login page
        await this.page.waitForURL(url => !url.href.includes('/auth/login'), { timeout: 5000 });
      }
    }

    return { token, user };
  }

  /**
   * Clear test auth data
   */
  async clearAuth() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.removeItem('test_auth_token');
      localStorage.removeItem('test_auth_user');
    });
  }
}

/**
 * Quick helper function for tests
 * Phase-4.1: Handles storageState pre-authentication
 */
export async function loginAsConsumer(page: Page) {
  // Check if already pre-authenticated via storageState
  if (await hasPreauth(page.context())) {
    console.log('✅ Consumer already pre-authenticated via storageState');
    await page.goto('/');
    await waitForAuthState(page);
    return { token: 'storagestate-token', user: { role: 'consumer' } };
  }

  // Use UI login flow
  const helper = new TestAuthHelper(page);
  return helper.testLogin('consumer');
}

export async function loginAsProducer(page: Page) {
  // Check if already pre-authenticated via storageState
  if (await hasPreauth(page.context())) {
    console.log('✅ Producer already pre-authenticated via storageState');
    await page.goto('/');
    await waitForAuthState(page);
    return { token: 'storagestate-token', user: { role: 'producer' } };
  }

  // Use UI login flow
  const helper = new TestAuthHelper(page);
  return helper.testLogin('producer');
}

export async function loginAsAdmin(page: Page) {
  // Check if already pre-authenticated via storageState
  if (await hasPreauth(page.context())) {
    console.log('✅ Admin already pre-authenticated via storageState');
    await page.goto('/');
    await waitForAuthState(page);
    return { token: 'storagestate-token', user: { role: 'admin' } };
  }

  // Use UI login flow
  const helper = new TestAuthHelper(page);
  return helper.testLogin('admin');
}