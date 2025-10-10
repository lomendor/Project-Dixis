import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';

test('GET /api/orders/[id] επιστρέφει id/status/subtotal/computed*', async ({ request }) => {
  const ord = await request.post(base + '/api/checkout', {
    data: {
      items: [{ productId: 'seeded', qty: 2, price: 7.5 }],
      shipping: {
        name: 'Πελάτης',
        line1: 'Οδός 1',
        city: 'Αθήνα',
        postal: '11111',
        phone: '+306900000001',
        email: 'x@example.com',
        method: 'COURIER'
      },
      payment: { method: 'COD' }
    } as any
  });

  expect([200, 201]).toContain(ord.status());
  const j = await ord.json();
  const id = j.orderId || j.id;

  const r = await request.get(base + `/api/orders/${id}`);
  expect(r.status()).toBe(200);

  const data = await r.json();
  expect(data.id).toBe(id);
  expect(typeof data.status).toBe('string');
  expect(typeof data.subtotal).toBe('number');
  expect(typeof data.computedShipping).toBe('number');
  expect(typeof data.computedTotal).toBe('number');
  expect(data.subtotal).toBeGreaterThan(0);
});

test('POST /api/orders/[id]/resend επιστρέφει 200', async ({ request }) => {
  const ord = await request.post(base + '/api/checkout', {
    data: {
      items: [{ productId: 'seeded', qty: 1, price: 10 }],
      shipping: {
        name: 'Πελάτης',
        line1: 'Οδός 1',
        city: 'Αθήνα',
        postal: '11111',
        phone: '+306900000001',
        email: 'x@example.com',
        method: 'COURIER'
      },
      payment: { method: 'COD' }
    } as any
  });

  const j = await ord.json();
  const id = j.orderId || j.id;

  const r = await request.post(base + `/api/orders/${id}/resend`);
  expect([200, 204]).toContain(r.status());

  const data = await r.json();
  expect(data.ok).toBe(true);
  expect(data.id).toBe(id);
});

test('GET /api/orders/[id] επιστρέφει 404 για μη υπάρκον order', async ({ request }) => {
  const r = await request.get(base + `/api/orders/fake-order-id-12345`);
  expect(r.status()).toBe(404);

  const data = await r.json();
  expect(data.ok).toBe(false);
});
