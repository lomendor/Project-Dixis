import { http, HttpResponse } from 'msw';

export const handlersPass81 = [
  // Cart — v1 & legacy, items endpoints
  http.get('/api/v1/cart/items', () => HttpResponse.json({ ok:true, items:[], totals:{ items:0, shipment:0, grand:0 } })),
  http.get('/api/cart/items', () => HttpResponse.json({ ok:true, items:[], totals:{ items:0, shipment:0, grand:0 } })),
  http.post('/api/v1/cart', () => HttpResponse.json({ ok:true, items:[], totals:{ items:0, shipment:0, grand:0 } })),
  http.post('/api/cart', () => HttpResponse.json({ ok:true, items:[], totals:{ items:0, shipment:0, grand:0 } })),
  http.post('/api/v1/cart/validate', () => HttpResponse.json({ success:true, data:[] })),
  http.post('/api/cart/validate', () => HttpResponse.json({ success:true, data:[] })),
  
  // Checkout & validate
  http.post('/api/v1/checkout', () => HttpResponse.json({ ok:true, orderId:'ord_test_1', totals:{ items:1, shipment:4.9, grand:14.9 } })),
  http.post('/api/checkout', () => HttpResponse.json({ ok:true, orderId:'ord_test_1', totals:{ items:1, shipment:4.9, grand:14.9 } })),
  http.post('/api/v1/checkout/validate', () => HttpResponse.json({ ok:true, warnings:[] })),
  http.post('/api/checkout/validate', () => HttpResponse.json({ ok:true, warnings:[] })),
  
  // Shipping rates
  http.post('/api/v1/shipping/rates', () => HttpResponse.json({ ok:true, rates:[{ id:'door', label:'Door-to-door', total:4.9, currency:'EUR' }] })),
  http.post('/api/shipping/rates', () => HttpResponse.json({ ok:true, rates:[{ id:'door', label:'Door-to-door', total:4.9, currency:'EUR' }] })),
  
  // Payments
  http.post('/api/v1/payment_intent', () => HttpResponse.json({ ok:true, client_secret:'pi_test_123' })),
  http.post('/api/payment_intent', () => HttpResponse.json({ ok:true, client_secret:'pi_test_123' })),
  
  // GDPR
  http.post('/api/v1/dsr/export', () => HttpResponse.json({ ok:true, result:{ userId:'u_test', data:{ orders:[], messages:[] } } })),
  http.post('/api/v1/dsr/delete', () => new HttpResponse(null, { status:202 })),
  http.post('/api/dsr/export', () => HttpResponse.json({ ok:true, result:{ userId:'u_test', data:{ orders:[], messages:[] } } })),
  http.post('/api/dsr/delete', () => new HttpResponse(null, { status:202 })),

  // Error-paths (με query flags) — canonical codes
  http.post('/api/v1/shipping/rates?fail=rate', () =>
    new HttpResponse(JSON.stringify({ code:'CHECKOUT_RATE_UNAVAILABLE', userMessage:'temporary unavailable' }), { status:503, headers:{'Content-Type':'application/json'} })),
  http.post('/api/v1/payment_intent?fail=declined', () =>
    new HttpResponse(JSON.stringify({ code:'PAYMENT_DECLINED', userMessage:'declined' }), { status:402, headers:{'Content-Type':'application/json'} })),
];
