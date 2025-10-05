import { test, expect } from '@playwright/test';

test('[api] GET /api/producers returns list', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/producers');
  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.total).toBeGreaterThanOrEqual(0);
  expect(Array.isArray(j.items)).toBeTruthy();
});

test('[api] GET /api/producers/[id] returns single producer', async ({ request }) => {
  // First get list to have a valid ID
  const listRes = await request.get('http://localhost:3000/api/producers');
  const listData = await listRes.json();

  if (listData.items && listData.items.length > 0) {
    const firstId = listData.items[0].id;
    const res = await request.get(`http://localhost:3000/api/producers/${firstId}`);
    expect(res.ok()).toBeTruthy();
    const producer = await res.json();
    expect(producer.id).toBe(firstId);
    expect(producer.name).toBeTruthy();
  }
});
