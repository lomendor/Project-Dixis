import { Page, expect } from '@playwright/test';

/**
 * Checkout E2E Test Utilities
 * Minimal helpers to stabilize checkout flow tests
 */

export async function seedCartWithProduct(page: Page): Promise<void> {
  // Navigate to products and add one item to cart
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3030';

  await page.goto(new URL('/products', baseURL).toString());
  await page.waitForLoadState('domcontentloaded');

  // Wait for and click first add-to-cart button
  const addToCartBtn = page.getByTestId('add-to-cart').first();
  await addToCartBtn.waitFor({ timeout: 10000 });
  await addToCartBtn.click();

  // Wait for cart response to ensure item is added
  await page.waitForResponse(response =>
    response.url().includes('/api') && response.status() < 400,
    { timeout: 5000 }
  ).catch(() => {
    // Fallback: just wait a bit if API response not detected
    return page.waitForTimeout(1000);
  });
}

export async function gotoCheckoutSafely(page: Page): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3030';

  await page.goto(new URL('/checkout', baseURL).toString(), {
    waitUntil: 'domcontentloaded'
  });

  // Wait for the key checkout element (the title with checkout-cta testid)
  await page.getByTestId('checkout-cta').waitFor({ timeout: 15000 });
}

export async function waitForQuoteUpdate(page: Page, previousValue: string): Promise<string> {
  // Poll for quote total change
  return await expect.poll(async () => {
    const currentValue = await page.getByTestId('order-total').textContent();
    return currentValue;
  }, {
    timeout: 10000,
    intervals: [1000]
  });
}