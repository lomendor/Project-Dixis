import { test, expect } from '@playwright/test';

/**
 * Product ID API smoke test
 * Validates that /api/products/[id] returns product data by fetching dynamic ID from products list
 */
test('GET /api/products/[id] returns product data for existing product', async ({ request }) => {
  // First, get list of products to find a valid ID
  const listRes = await request.get('/api/products');
  expect(listRes.ok()).toBeTruthy();

  const listData = await listRes.json();
  const firstProduct = listData?.items?.[0] || listData?.[0];

  // Skip test if no products exist
  test.skip(!firstProduct, 'No products available in database');

  // Test product ID endpoint
  const res = await request.get(`/api/products/${firstProduct.id}`);

  // Should return 200 for existing product
  expect(res.status()).toBe(200);

  const json = await res.json();

  // Validate response structure
  expect(json).toHaveProperty('id');
  expect(json).toHaveProperty('title');
  expect(json).toHaveProperty('price');
  expect(json.id).toBe(firstProduct.id);

  console.log(`✅ Found product: ${json.title} (ID: ${json.id})`);
});
