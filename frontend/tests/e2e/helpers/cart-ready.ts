import { Page, expect } from '@playwright/test';

/**
 * Cart Ready Helper - Stable wait conditions for cart state verification
 *
 * Ensures cart has loaded into a stable state before proceeding with assertions.
 * Handles both empty and populated cart states with resilient waits.
 */
export async function waitForCartReady(page: Page) {
  // Wait for page to settle
  await page.waitForLoadState('networkidle');

  // Ensure cart root container is present
  await page.waitForSelector('[data-testid="cart-root"]', {
    state: 'visible',
    timeout: 8000
  });

  // Wait for stable state - either empty or with items
  // Use Promise.race to handle different possible end states
  await Promise.race([
    // Cart has items loaded
    page.locator('[data-testid="cart-item"]').first().waitFor({
      state: 'visible',
      timeout: 8000
    }),
    // Cart is in ready state (may have custom ready indicator)
    page.locator('[data-testid="cart-ready"]').waitFor({
      state: 'visible',
      timeout: 8000
    }),
    // Cart is empty
    page.locator('[data-testid="cart-empty"]').waitFor({
      state: 'visible',
      timeout: 8000
    }),
  ]).catch(() => {
    // If none of the above states are reached, continue with verification
    console.log('⚠️ Cart ready states not detected within timeout, proceeding with verification');
  });

  // Verify we have a stable state
  const hasItems = await page.locator('[data-testid="cart-item"]').first().isVisible().catch(() => false);
  const isEmpty = await page.locator('[data-testid="cart-empty"]').isVisible().catch(() => false);
  const hasReady = await page.locator('[data-testid="cart-ready"]').isVisible().catch(() => false);

  // At least one stable state should be present
  expect(hasItems || isEmpty || hasReady).toBeTruthy();

  console.log(`✅ Cart ready state verified - Items: ${hasItems}, Empty: ${isEmpty}, Ready: ${hasReady}`);
}

/**
 * Enhanced cart ready helper with custom timeout
 */
export async function waitForCartReadyWithTimeout(page: Page, timeout: number = 10000) {
  await page.waitForLoadState('networkidle');

  try {
    // Wait for cart container
    await page.waitForSelector('[data-testid="cart-root"]', {
      state: 'visible',
      timeout: timeout / 2
    });

    // Wait for stable content state
    await Promise.race([
      page.locator('[data-testid="cart-item"]').first().waitFor({
        state: 'visible',
        timeout
      }),
      page.locator('[data-testid="cart-ready"]').waitFor({
        state: 'visible',
        timeout
      }),
      page.locator('[data-testid="cart-empty"]').waitFor({
        state: 'visible',
        timeout
      }),
    ]);

    console.log('✅ Cart ready with custom timeout');
  } catch (error) {
    console.log(`⚠️ Cart ready timeout after ${timeout}ms, but continuing`);
  }

  // Always verify at least some cart state is visible
  const cartRoot = page.locator('[data-testid="cart-root"]');
  await expect(cartRoot).toBeVisible();
}

/**
 * Wait for cart to be ready and return the detected state
 */
export async function waitForCartReadyAndGetState(page: Page): Promise<'empty' | 'items' | 'ready' | 'unknown'> {
  await waitForCartReady(page);

  const hasItems = await page.locator('[data-testid="cart-item"]').first().isVisible().catch(() => false);
  const isEmpty = await page.locator('[data-testid="cart-empty"]').isVisible().catch(() => false);
  const hasReady = await page.locator('[data-testid="cart-ready"]').isVisible().catch(() => false);

  if (hasItems) return 'items';
  if (isEmpty) return 'empty';
  if (hasReady) return 'ready';
  return 'unknown';
}

/**
 * Legacy compatibility - wait for any cart content to load
 * Maps to existing patterns in test files
 */
export async function waitForCartContent(page: Page) {
  return waitForCartReady(page);
}