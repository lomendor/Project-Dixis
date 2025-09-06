/**
 * Deterministic Authentication Helpers for E2E Tests
 * Provides stable login flows without backend dependency flakiness
 */

import { Page, expect } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const STABLE_CREDENTIALS = {
  consumer: {
    email: 'testconsumer@example.com',
    password: 'password123'
  },
  producer: {
    email: 'testproducer@example.com', 
    password: 'password123'
  }
} as const;

export class StableAuthHelper {
  constructor(private page: Page) {}

  /**
   * Fast login via direct storage state (bypasses UI)
   * For tests that need auth but don't test login flow
   */
  async fastLogin(role: 'consumer' | 'producer'): Promise<void> {
    const credentials = STABLE_CREDENTIALS[role];
    
    // Set auth tokens directly in localStorage
    await this.page.addInitScript((authData) => {
      localStorage.setItem('auth_token', `mock_${authData.role}_token`);
      localStorage.setItem('user_role', authData.role);
      localStorage.setItem('user_email', authData.email);
    }, { role, email: credentials.email });

    // Set auth cookies
    await this.page.context().addCookies([
      {
        name: 'auth_session',
        value: `${role}_authenticated_session`, 
        domain: '127.0.0.1',
        path: '/'
      }
    ]);
  }

  /**
   * Reliable UI login with deterministic flow
   * For tests that specifically test login functionality
   */
  async uiLogin(role: 'consumer' | 'producer', options: { timeout?: number } = {}): Promise<void> {
    const credentials = STABLE_CREDENTIALS[role];
    const timeout = options.timeout || 15000;

    try {
      // Navigate to login with explicit wait
      await this.page.goto('/auth/login', { waitUntil: 'networkidle', timeout });
      
      // Wait for form to be interactive
      await this.page.waitForSelector('form input[type="email"]', { state: 'visible', timeout });
      
      // Fill credentials with small delays for stability
      await this.page.fill('input[type="email"]', credentials.email);
      await this.page.waitForTimeout(100);
      
      await this.page.fill('input[type="password"]', credentials.password);
      await this.page.waitForTimeout(100);
      
      // Submit with navigation wait
      await Promise.all([
        this.page.waitForURL('/', { timeout }),
        this.page.click('button[type="submit"]')
      ]);

      // Verify successful login
      await this.verifyAuthState(role);
      
    } catch (error) {
      console.error(`Login failed for ${role}:`, error);
      throw new Error(`Deterministic login failed for ${role}: ${error}`);
    }
  }

  /**
   * Verify authentication state is correct
   */
  async verifyAuthState(expectedRole: 'consumer' | 'producer'): Promise<void> {
    const authToken = await this.page.evaluate(() => localStorage.getItem('auth_token'));
    const userRole = await this.page.evaluate(() => localStorage.getItem('user_role'));
    
    expect(authToken).toContain(expectedRole);
    expect(userRole).toBe(expectedRole);
  }

  /**
   * Clear all auth state for clean test start
   */
  async clearAuth(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
    });
    
    await this.page.context().clearCookies();
  }

  /**
   * Check if currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('auth_token'));
    return !!token;
  }
}

/**
 * Helper function to create stable auth helper
 */
export function createAuthHelper(page: Page): StableAuthHelper {
  return new StableAuthHelper(page);
}