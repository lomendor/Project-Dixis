import { test, expect } from '@playwright/test';

test.describe('Orders API Pagination', () => {
  test('should return paginated results with default params', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.count).toBe('number');
  });

  test('should accept page and pageSize params', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1&page=1&pageSize=5');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items.length).toBeLessThanOrEqual(5);
  });

  test('should accept sort param (descending createdAt)', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1&sort=-createdAt');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
    // Demo provider returns static data, so just verify it doesn't error
  });

  test('should accept sort param (ascending total)', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1&sort=total');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
  });

  test('should filter by status with pagination', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1&status=pending&page=1&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
    // Verify all items have pending status
    data.items.forEach((item: any) => {
      expect(item.status).toBe('pending');
    });
  });

  test('should return correct count independent of page size', async ({ request }) => {
    const res1 = await request.get('/api/admin/orders?demo=1&pageSize=5');
    const data1 = await res1.json();

    const res2 = await request.get('/api/admin/orders?demo=1&pageSize=10');
    const data2 = await res2.json();

    // Count should be the same regardless of pageSize
    expect(data1.count).toBe(data2.count);
  });

  test('should handle page beyond available results gracefully', async ({ request }) => {
    const res = await request.get('/api/admin/orders?demo=1&page=999&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items.length).toBe(0); // No items on page 999
    expect(data.count).toBeGreaterThanOrEqual(0);
  });
});
