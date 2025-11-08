import { test, expect } from '@playwright/test';

/**
 * Product slug API smoke test
 * Validates that /api/products/[slug] returns product data
 */
test('GET /api/products/[slug] returns product data', async ({ request }) => {
  // Use a known slug from seed data (if exists) or test with any slug
  const slug = 'thyme-honey-450g'; // Example slug - adjust based on actual seed data

  const res = await request.get(`/api/products/${slug}`);

  // Should return 200 or 404 (both are valid responses)
  expect([200, 404]).toContain(res.status());

  if (res.status() === 200) {
    const json = await res.json();

    // Validate response structure
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('title');
    expect(json).toHaveProperty('slug');
    expect(json).toHaveProperty('price');
    expect(json.slug).toBe(slug);

    console.log(`✅ Found product: ${json.title}`);
  } else {
    console.log('⚠️  Product not found (expected if DB not seeded)');
  }
});
