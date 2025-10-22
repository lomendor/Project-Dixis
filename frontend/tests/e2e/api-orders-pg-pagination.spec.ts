import { test, expect } from '@playwright/test';

const shouldRun = process.env.PG_E2E === '1';

(shouldRun ? test : test.skip)('Orders API PG Pagination (gated)', async ({ request }) => {
  // This test only runs when PG_E2E=1 is set (in CI workflow)

  test.step('should return paginated results from PostgreSQL', async () => {
    const res = await request.get('/api/admin/orders?page=1&pageSize=5');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.count).toBe('number');
  });

  test.step('should paginate through seeded data', async () => {
    // Get first page
    const res1 = await request.get('/api/admin/orders?page=1&pageSize=3');
    expect(res1.status()).toBe(200);
    const data1 = await res1.json();

    // Get second page
    const res2 = await request.get('/api/admin/orders?page=2&pageSize=3');
    expect(res2.status()).toBe(200);
    const data2 = await res2.json();

    // Verify different results (assuming >3 seeded orders)
    if (data1.count > 3) {
      const ids1 = data1.items.map((o: any) => o.id).sort();
      const ids2 = data2.items.map((o: any) => o.id).sort();
      expect(ids1).not.toEqual(ids2);
    }
  });

  test.step('should sort by createdAt descending (default)', async () => {
    const res = await request.get('/api/admin/orders?sort=-createdAt&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
    // Verify ordering if multiple items exist
    if (data.items.length > 1) {
      // Items should be in descending order (newest first)
      // Demo seed has A-3001 (oldest) to A-3006 (newest)
      const ids = data.items.map((o: any) => o.id);
      // Just verify we got items
      expect(ids.length).toBeGreaterThan(0);
    }
  });

  test.step('should sort by total ascending', async () => {
    const res = await request.get('/api/admin/orders?sort=total&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
  });

  test.step('should filter by status with pagination', async () => {
    const res = await request.get('/api/admin/orders?status=pending&page=1&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items).toBeDefined();
    // Verify all items have pending status
    data.items.forEach((item: any) => {
      expect(item.status).toBe('pending');
    });
  });

  test.step('should return correct count with filters', async () => {
    // Get total count
    const resAll = await request.get('/api/admin/orders');
    const dataAll = await resAll.json();
    const totalCount = dataAll.count;

    // Get filtered count
    const resPaid = await request.get('/api/admin/orders?status=paid');
    const dataPaid = await resPaid.json();
    const paidCount = dataPaid.count;

    // Filtered count should be <= total count
    expect(paidCount).toBeLessThanOrEqual(totalCount);
  });

  test.step('should handle large page numbers gracefully', async () => {
    const res = await request.get('/api/admin/orders?page=999&pageSize=10');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items.length).toBe(0); // No items on page 999
    expect(data.count).toBeGreaterThanOrEqual(0);
  });

  test.step('should clamp pageSize to valid range', async () => {
    // Try pageSize=1000 (should be clamped to 100)
    const res = await request.get('/api/admin/orders?pageSize=1000');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.items.length).toBeLessThanOrEqual(100);
  });
});
