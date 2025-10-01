import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

export const handlersPass7 = [
  // Cart endpoints - return proper structure with items array
  http.get(`${API_BASE}/cart`, () => 
    HttpResponse.json({ 
      ok: true, 
      cart_items: [{ id: 1, product_id: 1, name: 'Test Product', quantity: 1, price: '10.00' }],
      totals: { items: 1, shipment: 0, grand: 10 } 
    })
  ),
  http.get(`${API_BASE}/cart/items`, () => 
    HttpResponse.json({ 
      cart_items: [{ id: 1, product_id: 1, product: { name: 'Test Product' }, quantity: 1, subtotal: '10.00' }],
      total_items: 1,
      total_amount: '10.00'
    })
  ),
  http.post(`${API_BASE}/cart`, () => 
    HttpResponse.json({ ok: true, items: [{ id: 1, product_id: 1, quantity: 1 }] })
  ),
  http.post(`${API_BASE}/cart/validate`, () => 
    HttpResponse.json({ 
      success: true, 
      data: [{ product_id: 1, name: 'Test Product', quantity: 1, price: '10.00', available: true }] 
    })
  ),

  // Checkout endpoints - proper success response
  http.post(`${API_BASE}/checkout`, () => 
    HttpResponse.json({ 
      ok: true, 
      success: true,
      data: { id: 'order_123', order_id: 'order_123', total: '14.90' },
      orderId: 'order_123',
      totals: { items: 10, shipment: 4.9, grand: 14.9 } 
    })
  ),
  http.post(`${API_BASE}/orders/checkout`, () => 
    HttpResponse.json({ 
      success: true,
      data: { id: 'order_123', order_id: 'order_123', total: '14.90' }
    })
  ),
  http.post(`${API_BASE}/checkout/validate`, () => 
    HttpResponse.json({ ok: true, warnings: [] })
  ),

  // Shipping endpoints - return 2 methods for standard postal codes
  http.post(`${API_BASE}/shipping/rates`, async ({ request }) => {
    const body = await request.json() as any;
    const postalCode = body.destination?.postal_code || body.postal_code || '10671';
    
    // Remote islands with 1 method
    if (['19010', '23086', '63086', '83103'].includes(postalCode)) {
      return HttpResponse.json({
        ok: true,
        rates: [{ id: 'island', name: 'Island Express', label: 'Island Express', price: 12.5, total: 12.5, currency: 'EUR', estimated_days: 5 }]
      });
    }
    
    // Standard locations - 2 methods
    return HttpResponse.json({
      ok: true,
      rates: [
        { id: 'standard', name: 'Standard', label: 'Standard', price: 3.5, total: 3.5, currency: 'EUR', estimated_days: 2 },
        { id: 'express', name: 'Express', label: 'Express', price: 5.9, total: 5.9, currency: 'EUR', estimated_days: 1 }
      ]
    });
  }),
  http.post(`${API_BASE}/shipping/quote`, async ({ request }) => {
    const body = await request.json() as any;
    const postalCode = body.destination?.postal_code || body.postal_code || '10671';
    
    if (['19010', '23086', '63086', '83103'].includes(postalCode)) {
      return HttpResponse.json({
        shipping_methods: [{ id: 'island', name: 'Island Express', price: 12.5, estimated_days: 5 }]
      });
    }
    
    return HttpResponse.json({
      shipping_methods: [
        { id: 'standard', name: 'Standard', price: 3.5, estimated_days: 2 },
        { id: 'express', name: 'Express', price: 5.9, estimated_days: 1 }
      ]
    });
  }),

  // Payment endpoints
  http.post(`${API_BASE}/payment_intent`, () => 
    HttpResponse.json({ ok: true, client_secret: 'pi_test_123' })
  ),

  // Producer endpoints
  http.get(`${API_BASE}/producer/status`, () => 
    HttpResponse.json({ authenticated: true, role: 'producer' })
  ),

  // GDPR endpoints
  http.post(`${API_BASE}/dsr/export`, () => 
    HttpResponse.json({ ok: true, result: { userId: 'u_test', data: { orders: [], messages: [] } } })
  ),
  http.post(`${API_BASE}/dsr/delete`, () => 
    new HttpResponse(null, { status: 202 })
  ),

  // Error paths for error-handling tests
  http.post(`${API_BASE}/shipping/rates?fail=rate`, () => 
    new HttpResponse(
      JSON.stringify({ code: 'CHECKOUT_RATE_UNAVAILABLE', userMessage: 'Προσωρινό πρόβλημα με τα μεταφορικά' }), 
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  ),
  http.post(`${API_BASE}/payment_intent?fail=declined`, () => 
    new HttpResponse(
      JSON.stringify({ code: 'PAYMENT_DECLINED', userMessage: 'Η πληρωμή δεν εγκρίθηκε' }), 
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    )
  ),
];
