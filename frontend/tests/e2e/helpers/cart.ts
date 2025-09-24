import { Page, expect } from '@playwright/test';

export async function waitForCartReady(page: Page) {
  // Wait for cart to finish loading, but with maximum time.
  const item = page.locator('[data-testid="cart-item"]');
  const ready = page.locator('[data-testid="cart-ready"]');
  const empty = page.locator('[data-testid="cart-empty"]');

  // Parallel wait for one of the three states
  await Promise.race([
    item.first().waitFor({ state: 'visible', timeout: 8000 }),
    ready.waitFor({ state: 'visible', timeout: 8000 }),
    empty.waitFor({ state: 'visible', timeout: 8000 }),
  ]).catch(() => {}); // Will follow with assert

  // Final reliable assert: either we have items or empty
  const hasItems = await item.first().isVisible();
  const isEmpty = await empty.isVisible();
  expect(hasItems || isEmpty).toBeTruthy();
}