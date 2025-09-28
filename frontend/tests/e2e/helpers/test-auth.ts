import { Page } from '@playwright/test';

// Ensure page is on our base origin before any storage reads/writes or URL assertions
async function ensureSameOrigin(page: Page) {
  // On CI Playwright often starts at about:blank; force landing to baseURL ('/')
  try {
    const u = page.url();
    if (!u || u === 'about:blank' || /^data:/.test(u)) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch (e) {
    // Best-effort; let callers handle assertions next
  }
}

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

    // Also store in localStorage for client-side API calls (ensure same-origin)
    await ensureSameOrigin(this.page);
    await this.page.evaluate(({ token, user }) => {
      try {
        localStorage.setItem('test_auth_token', token);
        localStorage.setItem('test_auth_user', JSON.stringify(user));
      } catch (e) {
        // Ignore localStorage SecurityError; cookies are sufficient
      }
    }, { token, user });

    // Force page reload to ensure auth state is recognized by components
    await this.page.reload();
    await this.page.waitForLoadState('networkidle'); // Wait for API calls to complete

    // Navigate to home page after login
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });

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
    await ensureSameOrigin(this.page);
    await this.page.evaluate(() => {
      try {
        localStorage.removeItem('test_auth_token');
        localStorage.removeItem('test_auth_user');
      } catch (e) {
        // Ignore localStorage SecurityError
      }
    });
  }
}

/**
 * Quick helper function for tests
 */
export async function loginAsConsumer(page: Page) {
  await ensureSameOrigin(page);
  const helper = new TestAuthHelper(page);
  return helper.testLogin('consumer');
}

export async function loginAsProducer(page: Page) {
  await ensureSameOrigin(page);
  const helper = new TestAuthHelper(page);
  return helper.testLogin('producer');
}

export async function loginAsAdmin(page: Page) {
  await ensureSameOrigin(page);
  const helper = new TestAuthHelper(page);
  return helper.testLogin('admin');
}