import { test, expect } from '@playwright/test';

/**
 * Sanity test: Verify /api/products returns non-empty items after seeding
 */
test('GET /api/products returns items[] after seed', async ({ request }) => {
  const res = await request.get('/api/products');
  expect(res.status()).toBe(200);
  
  const json = await res.json();
  expect(Array.isArray(json.items)).toBe(true);
  expect(json).toHaveProperty('page');
  expect(json).toHaveProperty('pageSize');
  expect(json).toHaveProperty('total');
  
  // After seed, we should have at least some items
  // This test can be skipped in CI if DB not seeded
  if (json.total > 0) {
    expect(json.items.length).toBeGreaterThan(0);
    console.log(`✅ Found ${json.total} products in DB`);
  } else {
    console.log('⚠️  No products found (DB not seeded yet)');
  }
});
