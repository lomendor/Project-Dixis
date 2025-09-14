/**
 * E2E Root Wait Helper - Resilient Page Load Detection
 * Handles both Next.js app dir and pages dir root selectors
 */

import { Page } from '@playwright/test';

/**
 * Wait for page root element with fallback selectors
 * Supports both data-testid="page-root" and Next.js #__next
 * CI-resilient with multiple fallbacks
 */
export async function waitForRoot(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  
  // Try multiple strategies for CI resilience
  try {
    await page.waitForSelector('[data-testid="page-root"], #__next', { timeout: 10000 });
  } catch {
    // Fallback 1: Wait for any main content
    try {
      await page.waitForSelector('main, body > div', { timeout: 5000 });
    } catch {
      // Fallback 2: Just ensure DOM is interactive
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    }
  }
}