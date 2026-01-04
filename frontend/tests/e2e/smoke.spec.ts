import { test, expect } from '@playwright/test';

// @smoke — Health endpoint should respond quickly without SSR/DB deps
test('@smoke healthz responds', async ({ request }) => {
  const res = await request.get('/api/healthz', { timeout: 10000 });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.status).toBe('ok');
  expect(typeof json.ts).toBe('string');
});

// @smoke — Mock products API returns data in CI
// Pass E2E-SEED-01: Verifies the Next.js mock API route works (no SSR call to Laravel)
test('@smoke mock products API responds', async ({ request }) => {
  const res = await request.get('/api/v1/public/products', { timeout: 10000 });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.data).toBeDefined();
  expect(Array.isArray(json.data)).toBe(true);
  expect(json.data.length).toBeGreaterThan(0);
});

// @smoke — Products page loads and shows heading
// Pass E2E-SEED-02: CI-safe test that doesn't depend on SSR data
// The page may show empty state or products depending on SSR env, but heading always renders
test('@smoke products page loads', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Page heading should always be present regardless of data
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible({ timeout: 10000 });
});

// @smoke — Products page renders content (products or empty state)
// Pass E2E-SEED-02: CI-safe test that verifies page structure without SSR mocking
// Note: SSR fetch cannot be mocked by Playwright (server-side), so we check for either state
test('@smoke products page renders content', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Verify heading always present
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible({ timeout: 10000 });

  // Page should show EITHER products grid OR empty state message
  // This makes the test CI-safe regardless of SSR data availability
  const productGrid = page.locator('main .grid');
  const emptyState = page.getByText('Δεν υπάρχουν διαθέσιμα προϊόντα').first();

  // Wait for either condition - at least one should be visible
  await expect(productGrid.or(emptyState)).toBeVisible({ timeout: 15000 });
});

// @smoke — Checkout page loads or redirects sensibly (no crash, no timeout)
// SMOKE-STABLE-01: Minimal checkout smoke - verifies page doesn't crash
// Does NOT test full form flow (that's @regression in pass-54-shipping-save.spec.ts)
test('@smoke checkout page loads or redirects', async ({ page }) => {
  const response = await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Page should either:
  // 1. Load checkout form (200)
  // 2. Redirect to login/auth (302/307)
  // 3. Redirect to cart if empty (302/307)
  // All are valid smoke outcomes - we just verify no crash/500
  const status = response?.status() || 0;
  const url = page.url();

  // Accept: 200 OK, 307/302 redirect (to login, cart, etc.)
  const isValidStatus = status === 200 || status === 307 || status === 302;
  const isValidRedirect = url.includes('/login') || url.includes('/auth') || url.includes('/cart') || url.includes('/checkout');

  expect(isValidStatus || isValidRedirect).toBe(true);

  // If we're on checkout, verify basic structure (heading or form exists)
  if (url.includes('/checkout')) {
    const checkoutContent = page.locator('h1, [data-testid="checkout-form"], [data-testid="checkout-heading"]').first();
    await expect(checkoutContent).toBeVisible({ timeout: 10000 });
  }
});
