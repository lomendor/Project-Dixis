import { Page } from '@playwright/test';

/**
 * Test-only authentication helper for E2E tests
 * Uses special test login endpoint that's only available in test environments
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

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
    const testLoginUrl = baseUrl.replace('/api/v1', '/api/v1/test/login');

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

    // Navigate to baseURL first to ensure proper context for localStorage
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3030';
    await this.page.goto(baseURL);
    await this.page.waitForLoadState('networkidle');

    // Now safely store in localStorage for client-side API calls
    await this.page.evaluate(({ token, user }) => {
      localStorage.setItem('test_auth_token', token);
      localStorage.setItem('test_auth_user', JSON.stringify(user));
    }, { token, user });

    // Force page reload to ensure auth state is recognized by components
    await this.page.reload();
    await this.page.waitForLoadState('networkidle'); // Wait for API calls to complete

    // Wait for authenticated UI state instead of URL navigation
    try {
      // Primary: Look for user menu or navigation elements that appear post-login
      await this.page.waitForSelector('[data-testid="user-menu"], [data-testid="nav-user"], [data-testid="nav-account"]', {
        timeout: 15000,
        state: 'visible'
      });
    } catch {
      // Fallback: check if auth worked by looking for any logout/profile elements
      try {
        await this.page.waitForSelector('text=Logout, text=Sign Out, text=Profile, text=Dashboard', { timeout: 10000 });
      } catch {
        // Final fallback: ensure we're not stuck on login page and can see main content
        await this.page.waitForFunction(
          () => {
            return !window.location.href.includes('/auth/login') &&
                   document.readyState === 'complete' &&
                   document.body.innerText.length > 100; // Ensure page has content
          },
          { timeout: 15000 }
        );
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
 */
export async function loginAsConsumer(page: Page) {
  const helper = new TestAuthHelper(page);
  return helper.testLogin('consumer');
}

export async function loginAsProducer(page: Page) {
  const helper = new TestAuthHelper(page);
  return helper.testLogin('producer');
}

export async function loginAsAdmin(page: Page) {
  const helper = new TestAuthHelper(page);
  return helper.testLogin('admin');
}