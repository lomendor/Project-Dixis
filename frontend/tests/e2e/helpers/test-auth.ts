import { Page } from '@playwright/test';

/**
 * Test-only authentication helper for E2E tests
 * Uses special test login endpoint that's only available in test environments
 */
export class TestAuthHelper {
  private token: string | null = null;

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
    this.token = token; // keep token for API fallback

    // Cookie (non-HttpOnly) for parity with bridge
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

    // CRITICAL: Ensure localStorage is populated BEFORE any document loads.
    await this.page.addInitScript(({ token, user }) => {
      try {
        window.localStorage.setItem('test_auth_token', token);
        window.localStorage.setItem('auth_token', token);
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('test_auth_user', JSON.stringify(user));
        // small debug
        console.log('[e2e] initScript set test_auth_token');
      } catch (e) {
        console.log('[e2e] initScript error', String(e));
      }
    }, { token, user });

    // Navigate to home page after login
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');

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

  getAuthHeader() {
    if (!this.token) throw new Error('No test auth token available; call testLogin() first');
    return { Authorization: `Bearer ${this.token}` };
  }

  /**
   * Ensure ALL UI requests send Authorization automatically.
   * Call right after testLogin().
   */
  async applyAuthToContext() {
    if (!this.token) throw new Error('No token set; call testLogin() first');
    await this.page.context().setExtraHTTPHeaders({
      Authorization: `Bearer ${this.token}`,
    });
  }

  /**
   * Clear test auth data
   */
  async clearAuth() {
    this.token = null;
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.removeItem('test_auth_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
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