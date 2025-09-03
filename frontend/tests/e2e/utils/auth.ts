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
    
    // Wait for navigation after successful login (redirects to home)
    await this.page.waitForURL(/^[^?]*\/(dashboard|products|producer\/dashboard|$)/, { 
      timeout: 10000,
      waitUntil: 'networkidle'
    });
    
    // Verify login success (should NOT be on login page)
    const currentUrl = this.page.url();
    expect(currentUrl).not.toMatch(/\/login/);
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
    await this.page.waitForURL(/\/(login|$)/, { 
      timeout: 5000,
      waitUntil: 'networkidle'
    });
  }

  /**
   * Clear all authentication state
   * Should be called in test.beforeEach for clean state
   */
  async clearAuthState(): Promise<void> {
    // Clear all cookies, localStorage, sessionStorage
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      } catch (e) {
        // SecurityError when localStorage is not accessible (e.g., about:blank)
        console.log('localStorage not accessible:', e.message);
      }
      
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch (e) {
        // SecurityError when sessionStorage is not accessible
        console.log('sessionStorage not accessible:', e.message);
      }
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
    
    // Wait for specific toast to appear with increased timeout
    // Note: Success toasts might appear briefly before page redirect
    await expect(toast).toBeVisible({ timeout: 15000 });
    
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