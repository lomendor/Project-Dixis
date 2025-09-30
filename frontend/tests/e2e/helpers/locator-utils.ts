import { Page, Locator, expect } from '@playwright/test';

/**
 * Try multiple locators and return the first one that becomes visible
 * Phase-3b: Robust fallback mechanism for auth forms
 */
export async function firstVisible(page: Page, locators: Locator[], timeoutMs = 45000): Promise<Locator> {
  const deadline = Date.now() + timeoutMs;
  let lastErr: unknown = null;

  for (const loc of locators) {
    const remaining = Math.max(500, deadline - Date.now());
    try {
      await loc.first().waitFor({ state: 'visible', timeout: remaining });
      return loc.first();
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`No locator became visible within ${timeoutMs}ms: ${lastErr}`);
}

/**
 * Wait for URL to NOT be login page
 * Phase-3b: Robust post-login verification
 */
export async function waitUrlNotLogin(page: Page, timeoutMs = 45000) {
  await expect(page).toHaveURL((url) => !/\/auth\/login/i.test(url.pathname), { timeout: timeoutMs });
}