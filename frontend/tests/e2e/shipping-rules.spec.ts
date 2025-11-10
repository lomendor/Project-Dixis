import { test, expect } from '@playwright/test';

test('Shipping becomes 0 above free-threshold; >0 below', async ({ request }) => {
  const list = await request.get('/api/products');
  const data = await list.json();
  const first = data?.items?.[0];
  test.skip(!first, 'No products');
  const price = Number(first.price || 0);
  test.skip(!(price > 0), 'First product has no price');

  // Read threshold from env (defaults mirrored in server)
  const TH = Number(process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR || 35);

  // qty to exceed threshold
  const qtyAbove = Math.ceil((TH + 1) / price);
  const qtyBelow = Math.max(1, qtyAbove - 1);

  const qBelow = await request.post('/api/v1/shipping/quote', {
    data: { items: [{ slug: first.id, qty: qtyBelow }], zone: 'mainland' }
  });
  expect(qBelow.ok()).toBeTruthy();
  const b = await qBelow.json();
  expect(typeof b.total).toBe('number');
  expect(b.total).toBeGreaterThan(0);

  const qAbove = await request.post('/api/v1/shipping/quote', {
    data: { items: [{ slug: first.id, qty: qtyAbove }], zone: 'mainland' }
  });
  const a = await qAbove.json();
  expect(a.total).toBe(0);
});
