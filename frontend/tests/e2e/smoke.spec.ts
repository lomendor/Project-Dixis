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

// @smoke — Products page with mocked API renders product cards
// Pass E2E-SEED-02: Uses route mocking to inject product data client-side
test('@smoke products page renders cards with mocked data', async ({ page }) => {
  // Mock the API response before navigation
  const mockProducts = [
    {
      id: 1,
      name: 'CI Test Olive Oil',
      slug: 'ci-olive-oil',
      price: '15.50',
      image_url: null,
      producer: { id: 1, name: 'Test Producer' }
    },
    {
      id: 2,
      name: 'CI Test Honey',
      slug: 'ci-honey',
      price: '12.00',
      image_url: null,
      producer: { id: 2, name: 'Another Producer' }
    }
  ];

  // Intercept both SSR and client-side API calls
  await page.route('**/api/v1/public/products*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockProducts, total: mockProducts.length })
    });
  });

  // Also mock internal API calls (SSR uses different path patterns)
  await page.route('**/public/products*', async (route) => {
    // Only mock if it's an API request (not the page itself)
    if (route.request().url().includes('/api/') ||
        route.request().headers()['content-type']?.includes('application/json')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockProducts, total: mockProducts.length })
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/products', { waitUntil: 'networkidle', timeout: 30000 });

  // Verify heading
  await expect(page.getByRole('heading', { name: 'Προϊόντα' })).toBeVisible({ timeout: 10000 });

  // Verify product grid has items (using grid structure from page.tsx)
  const productGrid = page.locator('main .grid');
  await expect(productGrid).toBeVisible({ timeout: 10000 });

  // Should have at least one product card in the grid
  const cards = productGrid.locator('> div, > a');
  await expect(cards.first()).toBeVisible({ timeout: 10000 });
});
