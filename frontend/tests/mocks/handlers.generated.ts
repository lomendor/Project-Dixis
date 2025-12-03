import { http, HttpResponse } from 'msw';

export const generatedHandlers = [
  // Core API endpoints from observed fetch calls
  http.get('/api/health', () => HttpResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })),
  
  http.get('/api/producer/status', () => HttpResponse.json({
    isProducer: false,
    status: 'pending'
  })),
  
  http.post('/api/producer/onboarding', () => HttpResponse.json({
    success: true,
    message: 'Onboarding completed'
  })),
  
  http.get('/api/v1/products', () => HttpResponse.json({
    data: [],
    total: 0,
    current_page: 1,
    per_page: 15
  })),
  
  http.get('/api/v1/public/products', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.post('/api/v1/shipping/quote', () => HttpResponse.json({
    rates: [
      { service: 'standard', total: 4.90, currency: 'EUR', estimated_days: 2 },
      { service: 'express', total: 8.50, currency: 'EUR', estimated_days: 1 }
    ]
  })),
  
  http.get('/api/v1/shipping/labels/:orderId', () => HttpResponse.json({
    label_url: 'https://example.com/label.pdf',
    tracking_number: 'TRACK123456'
  })),
  
  http.get('/api/v1/lockers/search', () => HttpResponse.json({
    lockers: []
  })),
  
  http.post('/api/checkout/quote', () => HttpResponse.json({
    subtotal: 100.00,
    shipping: 4.90,
    tax: 24.00,
    total: 128.90
  })),
  
  http.post('/api/checkout/pay', () => HttpResponse.json({
    success: true,
    order_id: 'ord_12345',
    payment_intent_id: 'pi_test'
  })),
  
  http.get('/api/producer/products', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.get('/api/producer/orders', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.get('/api/admin/producers', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.post('/api/admin/producers/:producerId/:action', () => HttpResponse.json({
    success: true
  })),
  
  http.post('/api/admin/orders/:orderId/update-status', () => HttpResponse.json({
    success: true
  })),
  
  // Analytics endpoints
  http.get('/api/v1/admin/analytics/sales', () => HttpResponse.json({
    sales: [],
    total: 0
  })),
  
  http.get('/api/v1/admin/analytics/orders', () => HttpResponse.json({
    orders: [],
    total: 0
  })),
  
  http.get('/api/v1/admin/analytics/products', () => HttpResponse.json({
    products: [],
    total: 0
  })),
  
  http.get('/api/v1/admin/analytics/producers', () => HttpResponse.json({
    producers: [],
    total: 0
  })),
  
  http.get('/api/v1/admin/analytics/dashboard', () => HttpResponse.json({
    summary: {
      total_sales: 0,
      total_orders: 0,
      total_producers: 0
    }
  })),
  
  // Notifications
  http.get('/api/v1/notifications', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.get('/api/v1/notifications/unread-count', () => HttpResponse.json({
    count: 0
  })),
  
  http.get('/api/v1/notifications/latest', () => HttpResponse.json({
    data: []
  })),
  
  http.post('/api/v1/notifications/:id/read', () => HttpResponse.json({
    success: true
  })),
  
  http.post('/api/v1/notifications/read-all', () => HttpResponse.json({
    success: true
  })),
  
  // Refunds
  http.get('/api/v1/refunds/orders', () => HttpResponse.json({
    data: [],
    total: 0
  })),
  
  http.get('/api/v1/refunds/orders/:orderId', () => HttpResponse.json({
    refund: null
  })),
  
  http.post('/api/v1/refunds/orders/:orderId', () => HttpResponse.json({
    success: true,
    refund_id: 'ref_12345'
  })),
  
  // Payment
  http.post('/api/v1/payment', () => HttpResponse.json({
    client_secret: 'pi_test_client_secret'
  })),
];
