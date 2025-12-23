import { test, expect } from '@playwright/test';

test('cart persists after add-to-cart on prod (canonical redirect)', async ({ page }) => {
  // Start on www (should redirect to apex)
  await page.goto('https://www.dixis.gr/products/1', { waitUntil: 'domcontentloaded' });

  // Verify redirect happened: www → apex
  expect(page.url()).toContain('https://dixis.gr/products/1');
  expect(page.url()).not.toContain('www.');

  // Add to cart (uses first matching button to avoid strict mode violation)
  await expect(page.getByTestId('add-to-cart').first()).toBeVisible();
  await page.getByTestId('add-to-cart').first().click();

  // Wait for animation
  await page.waitForTimeout(500);

  // Navigate to cart (should already be on apex, so no redirect needed)
  await page.goto('https://dixis.gr/cart', { waitUntil: 'domcontentloaded' });

  // Cart must show items (not empty)
  await expect(page.locator('body')).not.toContainText('Το καλάθι σου είναι άδειο');
});

test('canonical redirect: www → apex (no port in URL)', async ({ page }) => {
  // Navigate to www domain
  const response = await page.goto('https://www.dixis.gr/products', { waitUntil: 'domcontentloaded' });

  // Verify redirect happened
  expect(page.url()).toBe('https://dixis.gr/products');
  expect(page.url()).not.toContain('www.');
  expect(page.url()).not.toContain(':3000'); // Critical: no port in redirect URL

  // Verify redirect was 301 (permanent)
  const redirectChain = response?.request().redirectedFrom();
  if (redirectChain) {
    const finalResponse = await redirectChain.response();
    expect([301, 302, 307, 308]).toContain(finalResponse?.status() || 0);
  }
});

test('cart persists across www/apex navigation', async ({ page }) => {
  // Add item via www (will redirect to apex)
  await page.goto('https://www.dixis.gr/products/1', { waitUntil: 'domcontentloaded' });
  expect(page.url()).toContain('https://dixis.gr/'); // Redirected

  await expect(page.getByTestId('add-to-cart').first()).toBeVisible();
  await page.getByTestId('add-to-cart').first().click();
  await page.waitForTimeout(500);

  // Navigate to cart via apex (no redirect needed)
  await page.goto('https://dixis.gr/cart', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('Το καλάθι σου είναι άδειο');

  // Navigate to cart via www (will redirect to apex)
  await page.goto('https://www.dixis.gr/cart', { waitUntil: 'domcontentloaded' });
  expect(page.url()).toBe('https://dixis.gr/cart'); // Redirected
  expect(page.url()).not.toContain(':3000'); // No port in URL

  // Cart should still show items
  await expect(page.locator('body')).not.toContainText('Το καλάθι σου είναι άδειο');
});
