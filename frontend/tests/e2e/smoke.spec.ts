import { test, expect } from '@playwright/test';

// @smoke — Health endpoint should respond quickly without SSR/DB deps
test('@smoke healthz responds', async ({ request }) => {
  const res = await request.get('/api/healthz', { timeout: 10000 });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.status).toBe('ok');
  expect(typeof json.ts).toBe('string');
});

// @smoke — Products page renders with seeded CI data
// Pass E2E-SEED-01: Uses deterministic CI seed data
test('@smoke products page renders with seeded data', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });

  // Wait for products to load (CI seed creates 3 products)
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 });

  // Verify at least one product card is visible
  const productCards = page.locator('[data-testid="product-card"]');
  const count = await productCards.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// @smoke — Add to cart works with seeded products
// Pass E2E-SEED-01: Critical user journey (view product → add to cart)
test('@smoke add to cart works', async ({ page }) => {
  await page.goto('/products', { waitUntil: 'domcontentloaded' });

  // Wait for products
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 15000 });

  // Click first add-to-cart button
  const addButton = page.locator('[data-testid="add-to-cart-button"]').first();
  await addButton.click();

  // Verify cart badge updates (shows at least 1 item)
  const cartBadge = page.locator('[data-testid="cart-item-count"]');
  await expect(cartBadge).toContainText('1', { timeout: 5000 });
});
