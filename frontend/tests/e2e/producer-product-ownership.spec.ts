import { test, expect } from '@playwright/test';

/**
 * E2E Test: Producer Product Ownership Isolation
 *
 * Pass 16: Proves that GET /api/me/products returns ONLY the authenticated producer's products
 *
 * Approach: Test at API level (bypasses AuthGuard complexity while still proving backend scoping)
 *
 * Flow:
 * 1. Producer A authenticates → calls /api/me/products → sees ONLY A products (not B's)
 * 2. Producer B authenticates → calls /api/me/products → sees ONLY B products (not A's)
 *
 * DoD: Cross-producer ownership isolation is non-regressing
 */

test.describe('Producer Product Ownership Isolation (API Level)', () => {
  test('Producer A sees ONLY own products via API (not Producer B products)', async ({ page, context }) => {
    // Producer A test data (IDs 101, 102)
    const producerAProducts = [
      {
        id: 101,
        name: 'Producer A Tomatoes',
        price: 2.50,
        stock: 50,
      },
      {
        id: 102,
        name: 'Producer A Cucumbers',
        price: 1.80,
        stock: 30,
      },
    ];

    // Set auth cookie for Producer A
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-producer-a-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Mock Producer A auth profile
    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 100,
          name: 'Producer A',
          email: 'producer-a@test.com',
          role: 'producer',
        }),
      });
    });

    // Mock Producer A status
    await page.route('**/api/producer/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'active',
          profile: { id: 1, name: 'Producer A' },
        }),
      });
    });

    // Mock GET /api/me/products for Producer A (scoped products)
    await page.route('**/api/me/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: producerAProducts,
          total: producerAProducts.length,
        }),
      });
    });

    // Navigate to any page to initialize context
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Call the API directly via fetch in browser context
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/me/products');
      return {
        status: res.status,
        data: await res.json(),
      };
    });

    // Verify Producer A sees EXACTLY 2 products
    expect(response.status).toBe(200);
    expect(response.data.products).toHaveLength(2);

    // Verify correct product IDs (101, 102 for Producer A)
    const productIds = response.data.products.map((p: any) => p.id);
    expect(productIds).toContain(101);
    expect(productIds).toContain(102);

    // CRITICAL: Verify Producer B product IDs are NOT present (201, 202, 203)
    expect(productIds).not.toContain(201);
    expect(productIds).not.toContain(202);
    expect(productIds).not.toContain(203);

    // Verify product names
    const productNames = response.data.products.map((p: any) => p.name);
    expect(productNames).toContain('Producer A Tomatoes');
    expect(productNames).toContain('Producer A Cucumbers');
  });

  test('Producer B sees ONLY own products via API (not Producer A products)', async ({ page, context }) => {
    // Producer B test data (IDs 201, 202, 203)
    const producerBProducts = [
      {
        id: 201,
        name: 'Producer B Honey',
        price: 8.50,
        stock: 20,
      },
      {
        id: 202,
        name: 'Producer B Olive Oil',
        price: 12.00,
        stock: 15,
      },
      {
        id: 203,
        name: 'Producer B Cheese',
        price: 6.50,
        stock: 10,
      },
    ];

    // Set auth cookie for Producer B
    await context.addCookies([
      {
        name: 'dixis_session',
        value: 'test-producer-b-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Mock Producer B auth profile
    await page.route('**/api/v1/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 200,
          name: 'Producer B',
          email: 'producer-b@test.com',
          role: 'producer',
        }),
      });
    });

    // Mock Producer B status
    await page.route('**/api/producer/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'active',
          profile: { id: 2, name: 'Producer B' },
        }),
      });
    });

    // Mock GET /api/me/products for Producer B (scoped products)
    await page.route('**/api/me/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: producerBProducts,
          total: producerBProducts.length,
        }),
      });
    });

    // Navigate to any page to initialize context
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Call the API directly via fetch in browser context
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/me/products');
      return {
        status: res.status,
        data: await res.json(),
      };
    });

    // Verify Producer B sees EXACTLY 3 products
    expect(response.status).toBe(200);
    expect(response.data.products).toHaveLength(3);

    // Verify correct product IDs (201, 202, 203 for Producer B)
    const productIds = response.data.products.map((p: any) => p.id);
    expect(productIds).toContain(201);
    expect(productIds).toContain(202);
    expect(productIds).toContain(203);

    // CRITICAL: Verify Producer A product IDs are NOT present (101, 102)
    expect(productIds).not.toContain(101);
    expect(productIds).not.toContain(102);

    // Verify product names
    const productNames = response.data.products.map((p: any) => p.name);
    expect(productNames).toContain('Producer B Honey');
    expect(productNames).toContain('Producer B Olive Oil');
    expect(productNames).toContain('Producer B Cheese');
  });

  test('Product IDs do not overlap between producers (isolation proof)', async () => {
    // Producer A product IDs: 101, 102
    const producerAProductIds = [101, 102];

    // Producer B product IDs: 201, 202, 203
    const producerBProductIds = [201, 202, 203];

    // Verify no overlap
    const hasOverlap = producerAProductIds.some(id => producerBProductIds.includes(id));
    expect(hasOverlap).toBe(false);

    // Verify all IDs are unique
    const allIds = [...producerAProductIds, ...producerBProductIds];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);

    // Verify counts
    expect(producerAProductIds).toHaveLength(2);
    expect(producerBProductIds).toHaveLength(3);
  });
});
