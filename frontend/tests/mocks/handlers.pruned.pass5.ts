import { http, HttpResponse } from 'msw';

/**
 * Pass 5: Pruned MSW handlers with accurate shapes for failing tests
 * These handlers take priority over generated handlers
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

export const handlersPrunedPass5 = [
  // Shipping rates - handles both /api/shipping/rates and /api/v1/shipping/quote
  http.post('/api/shipping/rates', async () =>
    HttpResponse.json({
      rates: [
        { id: 'door', label: 'Door-to-door', total: 4.9, currency: 'EUR', estimated_days: 2 },
        { id: 'standard', label: 'Standard', total: 3.5, currency: 'EUR', estimated_days: 3 },
      ],
      ok: true,
    })
  ),

  http.post(`${API_BASE}/shipping/quote`, async ({ request }) => {
    const body = (await request.json()) as any;
    const postalCode = body.destination?.postal_code || '10671';

    // Remote islands
    if (['19010', '23086', '63086', '83103'].includes(postalCode)) {
      return HttpResponse.json({
        shipping_methods: [{ id: 'island', name: 'Island Express', price: 12.5, estimated_days: 5 }],
      });
    }

    // Default Athens
    return HttpResponse.json({
      shipping_methods: [
        { id: 'standard', name: 'Standard', price: 3.5, estimated_days: 2 },
        { id: 'express', name: 'Express', price: 5.9, estimated_days: 1 },
      ],
    });
  }),

  // Cart operations
  http.get(`${API_BASE}/cart/items`, () =>
    HttpResponse.json({
      cart_items: [
        {
          id: 1,
          product: { id: 1, name: 'Test Product', price: '12.50', producer: { name: 'Test Producer' } },
          quantity: 2,
          subtotal: '25.00',
        },
      ],
      total_items: 1,
      total_amount: '25.00',
    })
  ),

  http.post('/api/cart/validate', async () =>
    HttpResponse.json({ ok: true, items: [], warnings: [] })
  ),

  // Checkout
  http.post('/api/checkout', async () =>
    HttpResponse.json({
      ok: true,
      orderId: 'ord_test_1',
      totals: { items: 1, shipment: 4.9, grand: 14.9 },
    })
  ),

  http.post(`${API_BASE}/orders/checkout`, () =>
    HttpResponse.json({
      order: {
        id: 'order_123',
        total: 34.5,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      },
    })
  ),

  // Payment
  http.post('/api/payment_intent', async () =>
    HttpResponse.json({ client_secret: 'pi_test_123', ok: true })
  ),

  http.post(`${API_BASE}/payment`, () =>
    HttpResponse.json({ client_secret: 'pi_test_client_secret' })
  ),

  // Producer status
  http.get('/api/producer/status', async () =>
    HttpResponse.json({ authenticated: true, role: 'producer', isProducer: true })
  ),

  // GDPR (already handled by handlers.pruned.ts but keeping for completeness)
  http.post('/api/dsr/export', async () =>
    HttpResponse.json({
      ok: true,
      result: { userId: 'u_test', data: { orders: [], messages: [] } },
    })
  ),

  http.post('/api/dsr/delete', async () => new HttpResponse(null, { status: 202 })),
];
