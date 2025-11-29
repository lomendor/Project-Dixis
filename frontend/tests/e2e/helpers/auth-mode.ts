import { BrowserContext, Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Phase-4.1: Auth mode detection helpers
 * Handles storageState pre-authentication vs UI login flows
 */

/**
 * Check if current context has pre-authentication via storageState
 */
export async function hasPreauth(ctx: BrowserContext): Promise<boolean> {
  try {
    // Check if storageState file exists and has auth cookies
    const storageStatePath = path.join(process.cwd(), 'test-results/storageState.json');

    if (!fs.existsSync(storageStatePath)) {
      return false;
    }

    // Get current context cookies
    const cookies = await ctx.cookies();

    // Look for Laravel authentication cookies
    const hasAuthCookies = cookies.some(cookie =>
      cookie.name.includes('laravel_session') ||
      cookie.name.includes('XSRF-TOKEN') ||
      cookie.name.includes('session')
    );

    // Also check if storageState file contains auth data
    let hasStorageAuth = false;
    try {
      const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
      hasStorageAuth = storageState.cookies && storageState.cookies.some((cookie: any) =>
        cookie.name.includes('laravel_session') ||
        cookie.name.includes('XSRF-TOKEN') ||
        cookie.name.includes('session')
      );
    } catch {
      // If can't parse storageState, assume no auth
      hasStorageAuth = false;
    }

    const result = hasAuthCookies || hasStorageAuth;
    console.log(`🔍 Pre-auth check: cookies=${hasAuthCookies}, storageState=${hasStorageAuth}, result=${result}`);

    return result;
  } catch (error) {
    console.log(`⚠️ Pre-auth check failed: ${error}`);
    return false;
  }
}

/**
 * Flexible URL expectation - handles both authenticated and non-authenticated states
 */
export async function expectAuthedOrLogin(page: Page): Promise<void> {
  const isPreAuthed = await hasPreauth(page.context());

  if (isPreAuthed) {
    // Pre-authenticated: expect to be on home or dashboard, not login
    console.log('✅ Pre-authenticated user - expecting home/dashboard');
    await expect(page).toHaveURL(/(\/|\/dashboard)(\?|$)/, { timeout: 15000 });
  } else {
    // Not authenticated: expect login redirect
    console.log('🔑 Non-authenticated user - expecting login redirect');
    await expect(page).toHaveURL(/\/auth\/login(\/|\?|$)/, { timeout: 15000 });
  }
}

/**
 * Wait for authentication state to settle
 */
export async function waitForAuthState(page: Page): Promise<void> {
  const isPreAuthed = await hasPreauth(page.context());

  if (isPreAuthed) {
    // For pre-authenticated users, wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Look for authenticated UI elements
    try {
      await page.waitForSelector('[data-testid="user-menu"], [data-testid="nav-user"], text=Logout', {
        timeout: 10000,
        state: 'visible'
      });
      console.log('✅ Authenticated UI elements found');
    } catch {
      // Fallback: just ensure we're not on login page
      await page.waitForFunction(
        () => !window.location.pathname.includes('/auth/login'),
        { timeout: 10000 }
      );
      console.log('✅ Confirmed not on login page');
    }
  } else {
    // For non-authenticated users, wait for login form
    await page.waitForSelector('[data-testid="auth-login-form"], form', {
      timeout: 10000,
      state: 'visible'
    });
    console.log('✅ Login form found');
  }
}