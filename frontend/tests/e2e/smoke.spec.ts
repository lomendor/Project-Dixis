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
  const emptyState = page.getByText('Δεν υπάρχουν διαθέσιμα προϊόντα');

  // Wait for either condition - at least one should be visible
  await expect(productGrid.or(emptyState)).toBeVisible({ timeout: 15000 });
});
