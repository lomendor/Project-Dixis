/**
 * Playwright test fixtures for improved stability
 * Pass 64: Scaffold for Retry Logic sprint
 */

import { test as base, expect as baseExpect } from '@playwright/test';
import { attempt } from '../utils/retry';

/**
 * Extended test with stability fixtures
 */
export const test = base.extend({
  /**
   * Click with retry on transient failures
   * Handles temporary element unavailability
   */
  clickStable: async ({ page }, use) => {
    async function clickStable(selector: string) {
      await attempt(
        () => page.click(selector),
        { retries: 1, delay: 250 }
      );
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture, not React Hook
    await use(clickStable);
  },

  /**
   * Fill input with retry logic
   */
  fillStable: async ({ page }, use) => {
    async function fillStable(selector: string, value: string) {
      await attempt(
        () => page.fill(selector, value),
        { retries: 1, delay: 250 }
      );
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture, not React Hook
    await use(fillStable);
  },

  /**
   * Wait for network idle with timeout
   */
  waitForNetworkIdle: async ({ page }, use) => {
    async function waitForNetworkIdle(timeout = 5000) {
      await page.waitForLoadState('networkidle', { timeout });
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture, not React Hook
    await use(waitForNetworkIdle);
  }
});

export const expect = baseExpect;
