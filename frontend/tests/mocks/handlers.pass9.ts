import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

/** Pass 9 — realistic fixtures for remaining 5 failing specs */
export const handlersPass9 = [
  // Cart validation with items (test expects data array with 1 item)
  http.get(`${API_BASE}/cart/items`, () =>
    HttpResponse.json({
      cart_items: [{
        id: 1,
        product_id: 1,
        product: { id: 1, name: 'Test Product', price: '10.00', producer: { name: 'Test Producer' } },
        quantity: 1,
        subtotal: '10.00'
      }],
      total_items: 1,
      total_amount: '10.00'
    })
  ),
  http.get('/api/v1/cart/items', () =>
    HttpResponse.json({
      cart_items: [{
        id: 1,
        product_id: 1,
        product: { id: 1, name: 'Test Product', price: '10.00', producer: { name: 'Test Producer' } },
        quantity: 1,
        subtotal: '10.00'
      }],
      total_items: 1,
      total_amount: '10.00'
    })
  ),

  // Cart validation endpoint - return success with data for valid carts
  http.post(`${API_BASE}/cart/validate`, async ({ request }) => {
    const body = await request.json() as any;
    // If invalid cart data, return errors
    if (body.items && body.items[0]?.quantity < 0) {
      return HttpResponse.json({ 
        success: false, 
        errors: [{ code: 'INVALID_QUANTITY', field: 'items[0].quantity', message: 'Quantity must be positive' }] 
      });
    }
    // Valid cart - return success with validated data
    return HttpResponse.json({
      success: true,
      data: [{
        product_id: 1,
        name: 'Test Product',
        quantity: 1,
        price: '10.00',
        available: true
      }]
    });
  }),
  http.post('/api/v1/cart/validate', async ({ request }) => {
    const body = await request.json() as any;
    if (body.items && body.items[0]?.quantity < 0) {
      return HttpResponse.json({ 
        success: false, 
        errors: [{ code: 'INVALID_QUANTITY', field: 'items[0].quantity', message: 'Quantity must be positive' }] 
      });
    }
    return HttpResponse.json({
      success: true,
      data: [{
        product_id: 1,
        name: 'Test Product',
        quantity: 1,
        price: '10.00',
        available: true
      }]
    });
  }),

  // Checkout processing - return success with proper shape
  http.post(`${API_BASE}/checkout`, () =>
    HttpResponse.json({ 
      success: true,
      ok: true,
      data: { id: 'order_123', order_id: 'order_123', total: '14.90' },
      orderId: 'order_123',
      totals: { items: 10, shipment: 4.9, grand: 14.9 }
    })
  ),
  http.post('/api/v1/checkout', () =>
    HttpResponse.json({
      success: true,
      ok: true,
      data: { id: 'order_123', order_id: 'order_123', total: '14.90' },
      orderId: 'order_123',
      totals: { items: 10, shipment: 4.9, grand: 14.9 }
    })
  ),
  http.post(`${API_BASE}/orders/checkout`, () =>
    HttpResponse.json({
      success: true,
      data: { id: 'greek_order_456', order_id: 'greek_order_456', total: '24.90' }
    })
  ),
  http.post('/api/v1/orders/checkout', () =>
    HttpResponse.json({
      success: true,
      data: { id: 'greek_order_456', order_id: 'greek_order_456', total: '24.90' }
    })
  ),

  // Shipping quote - return 2 methods as tests expect
  http.post(`${API_BASE}/shipping/quote`, () =>
    HttpResponse.json({
      success: true,
      data: [
        { id: 'standard', name: 'Standard', price: 3.5, estimated_days: 2 },
        { id: 'express', name: 'Express', price: 5.9, estimated_days: 1 }
      ]
    })
  ),
  http.post('/api/v1/shipping/quote', () =>
    HttpResponse.json({
      success: true,
      data: [
        { id: 'standard', name: 'Standard', price: 3.5, estimated_days: 2 },
        { id: 'express', name: 'Express', price: 5.9, estimated_days: 1 }
      ]
    })
  ),
  http.post(`${API_BASE}/shipping/rates`, () =>
    HttpResponse.json({
      ok: true,
      rates: [
        { id: 'door', label: 'Door-to-door', total: 4.9, currency: 'EUR' },
        { id: 'locker', label: 'Locker', total: 3.9, currency: 'EUR' }
      ]
    })
  ),
  http.post('/api/v1/shipping/rates', () =>
    HttpResponse.json({
      ok: true,
      rates: [
        { id: 'door', label: 'Door-to-door', total: 4.9, currency: 'EUR' },
        { id: 'locker', label: 'Locker', total: 3.9, currency: 'EUR' }
      ]
    })
  ),
];
