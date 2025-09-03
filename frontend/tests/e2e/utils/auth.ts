import { Page, expect } from '@playwright/test';

interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * E2E Authentication Helper
 * Provides reliable login/logout utilities for deterministic testing
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with provided credentials
   * Waits for redirect and verifies successful login
   */
  async login({ email, password }: LoginCredentials): Promise<void> {
    // Navigate to login page
    await this.page.goto('/auth/login');
    
    // Wait for login form to be ready
    await expect(this.page.getByTestId('login-form')).toBeVisible();
    
    // Fill login credentials
    await this.page.getByTestId('login-email').fill(email);
    await this.page.getByTestId('login-password').fill(password);
    
    // Submit login form
    await this.page.getByTestId('login-submit').click();
    
    // Wait for navigation after successful login
    await this.page.waitForURL(/\/(dashboard|products|$)/, { 
      timeout: 10000,
      waitUntil: 'networkidle'
    });
    
    // Verify login success (should NOT be on login page)
    const currentUrl = this.page.url();
    expect(currentUrl).not.toMatch(/\/auth\/login/);
  }

  /**
   * Login as test consumer
   */
  async loginAsConsumer(): Promise<void> {
    await this.login({
      email: 'test@dixis.local',
      password: 'Passw0rd!'
    });
  }

  /**
   * Login as test producer
   */
  async loginAsProducer(): Promise<void> {
    await this.login({
      email: 'producer@dixis.local',
      password: 'Passw0rd!'
    });
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Click logout button if present
    const logoutButton = this.page.getByTestId('logout-button').or(
      this.page.getByRole('button', { name: /logout|έξοδος/i })
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // Wait for redirect to home/login
    await this.page.waitForURL(/\/(auth\/login|$)/, { 
      timeout: 5000,
      waitUntil: 'networkidle'
    });
  }

  /**
   * Clear all authentication state
   * Should be called in test.beforeEach for clean state
   */
  async clearAuthState(): Promise<void> {
    // First ensure we're on a valid origin (not about:blank)
    const currentUrl = this.page.url();
    if (currentUrl === 'about:blank' || !currentUrl.startsWith('http')) {
      // Navigate to a safe page within our origin
      const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
      await this.page.goto(`${baseUrl}/auth/login`, { 
        waitUntil: 'domcontentloaded' 
      });
    }
    
    // Clear all cookies from context (safe for any origin state)
    await this.page.context().clearCookies();
    
    // Now safe to clear storage since we're on valid origin
    await this.page.evaluate(() => {
      try { localStorage.clear(); } catch (e) { /* ignore */ }
      try { sessionStorage.clear(); } catch (e) { /* ignore */ }
    });
  }

  /**
   * Wait for loading state to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loader to disappear
    const loader = this.page.getByTestId('loader').or(
      this.page.locator('[data-testid*="loading"]')
    );
    
    if (await loader.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loader).toBeHidden({ timeout: 10000 });
    }
  }

  /**
   * Wait for and verify toast message
   */
  async expectToast(type: 'success' | 'error', message?: string): Promise<void> {
    const toastSelector = `toast-${type}`;
    const toast = this.page.getByTestId(toastSelector);
    
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    if (message) {
      await expect(toast).toContainText(message);
    }
  }
}

/**
 * Standalone login function for backwards compatibility
 */
export async function login(page: Page, { email, password }: LoginCredentials): Promise<void> {
  const authHelper = new AuthHelper(page);
  await authHelper.login({ email, password });
}