/**
 * E2E Root Wait Helper - Resilient Page Load Detection
 * Handles both Next.js app dir and pages dir root selectors
 */

import { Page } from '@playwright/test';

/**
 * Wait for page root element with fallback selectors
 * Supports both data-testid="page-root" and Next.js #__next
 */
export async function waitForRoot(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('[data-testid="page-root"], #__next', { timeout: 15000 });
}