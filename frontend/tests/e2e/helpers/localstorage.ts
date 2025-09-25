import { Page } from '@playwright/test';

/**
 * Safely set localStorage items after navigation to avoid SecurityError
 * Must be called AFTER page.goto() to ensure origin is established
 */
export async function setLocalStorageAfterNav(page: Page, kv: Record<string, string>) {
  // Ensure page has loaded and origin is established
  await page.waitForLoadState('domcontentloaded');

  // Set localStorage items safely
  await page.evaluate((pairs) => {
    for (const [k, v] of Object.entries(pairs)) {
      localStorage.setItem(k, v as string);
    }
  }, kv);
}

/**
 * Get localStorage items safely
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  await page.waitForLoadState('domcontentloaded');

  return page.evaluate((k) => {
    return localStorage.getItem(k);
  }, key);
}

/**
 * Clear all localStorage items
 */
export async function clearLocalStorage(page: Page) {
  await page.waitForLoadState('domcontentloaded');

  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Initialize E2E test session with required localStorage items
 * Call this after page.goto() in test setup
 */
export async function initE2ESession(page: Page) {
  await setLocalStorageAfterNav(page, {
    'e2eMode': 'true',
    'locale': 'el',
    'authToken': 'e2e-test-token',
    'userRole': 'consumer',
    'userId': 'e2e-test-user'
  });
}