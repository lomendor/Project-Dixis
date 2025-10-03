import { http, HttpResponse } from 'msw';

// Pass 11: Minimal MSW fixtures for unskipping useCheckout + checkout-shipping-updates
// Dual-shape responses (data + direct) for compatibility

const dual = (o: any) => Object.assign({}, o, { data: { ...o } });

const mockItem = {
  id: 1,
  product_id: 1,
  sku: 'SKU-TEST-1',
  name: 'Test Product',
  quantity: 2,
  price: 10.00,
  subtotal: 20.00,
  product: {
    id: 1,
    name: 'Test Product',
    price: '10.00',
    producer: { name: 'Test Producer' }
  }
};

const mockTotals = {
  items: 20.00,
  shipping: 4.90,
  total: 24.90
};

const mockCart = {
  items: [mockItem],
  cart_items: [mockItem],
  total_items: 1,
  total_amount: '20.00',
  totals: mockTotals
};

const mockShippingRates = {
  ok: true,
  rates: [
    {
      id: 'standard',
      name: 'Κανονική Παράδοση',
      label: 'Κανονική Παράδοση',
      description: 'Παράδοση σε 2-3 εργάσιμες ημέρες',
      total: 4.90,
      price: 4.90,
      currency: 'EUR',
      estimated_days: 2
    },
    {
      id: 'express',
      name: 'Ταχεία Παράδοση',
      label: 'Ταχεία Παράδοση',
      description: 'Παράδοση την επόμενη ημέρα',
      total: 8.90,
      price: 8.90,
      currency: 'EUR',
      estimated_days: 1
    }
  ],
  shipping_methods: [
    {
      id: 'standard',
      name: 'Κανονική Παράδοση',
      label: 'Κανονική Παράδοση',
      description: 'Παράδοση σε 2-3 εργάσιμες ημέρες',
      total: 4.90,
      price: 4.90,
      currency: 'EUR',
      estimated_days: 2
    },
    {
      id: 'express',
      name: 'Ταχεία Παράδοση',
      label: 'Ταχεία Παράδοση',
      description: 'Παράδοση την επόμενη ημέρα',
      total: 8.90,
      price: 8.90,
      currency: 'EUR',
      estimated_days: 1
    }
  ]
};

const mockOrder = {
  id: 'order_test_123',
  total: 24.90,
  status: 'pending' as const,
  created_at: new Date().toISOString()
};

export const handlersPass11 = [
  // Cart endpoints
  http.get('/api/cart/items', () => HttpResponse.json(dual(mockCart))),
  http.get('/api/v1/cart/items', () => HttpResponse.json(dual(mockCart))),

  // Cart validation
  http.post('/api/cart/validate', () => HttpResponse.json({ success: true, data: mockCart })),
  http.post('/api/v1/cart/validate', () => HttpResponse.json({ success: true, data: mockCart })),

  // Shipping rates
  http.post('/api/shipping/rates', () => HttpResponse.json(dual(mockShippingRates))),
  http.post('/api/v1/shipping/rates', () => HttpResponse.json(dual(mockShippingRates))),
  http.get('/api/shipping/rates', () => HttpResponse.json(dual(mockShippingRates))),
  http.get('/api/v1/shipping/rates', () => HttpResponse.json(dual(mockShippingRates))),

  // Checkout/Orders
  http.post('/api/orders/checkout', () => HttpResponse.json({ order: mockOrder })),
  http.post('/api/v1/orders/checkout', () => HttpResponse.json({ order: mockOrder })),

  // Payment
  http.post('/api/payment_intent', () => HttpResponse.json(dual({ ok: true, client_secret: 'pi_test_123' }))),
  http.post('/api/v1/payment_intent', () => HttpResponse.json(dual({ ok: true, client_secret: 'pi_test_123' }))),

  // Producer status
  http.get('/api/producer/status', () => HttpResponse.json({ authenticated: true, role: 'producer' })),
  http.get('/api/v1/producer/status', () => HttpResponse.json({ authenticated: true, role: 'producer' })),

  // GDPR/DSR
  http.post('/api/dsr/export', () => HttpResponse.json({ ok: true, result: { userId: 'u_test', data: { orders: [], messages: [] } } })),
  http.post('/api/v1/dsr/export', () => HttpResponse.json({ ok: true, result: { userId: 'u_test', data: { orders: [], messages: [] } } })),
];
