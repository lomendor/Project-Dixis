import { http, HttpResponse } from 'msw';

const orderOk = {
  id: 'greek_order_456',
  total: 44.44,
  status: 'pending' as const,
  created_at: new Date().toISOString()
};

export const handlersPass102 = [
  // orders/checkout (v1 & legacy) — API returns { order: {...} }
  http.post('/api/v1/orders/checkout', async () => HttpResponse.json({ order: orderOk })),
  http.post('/api/orders/checkout',    async () => HttpResponse.json({ order: orderOk })),

  // shipping/rates failure: don't use query in path; read from searchParams
  http.post('/api/v1/shipping/rates', async ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('fail') === 'rate') {
      return new HttpResponse(JSON.stringify({ code:'CHECKOUT_RATE_UNAVAILABLE', userMessage:'temporary unavailable' }),
        { status:503, headers:{'Content-Type':'application/json'} });
    }
    return HttpResponse.json({ ok:true, rates:[
      { id:'door',   label:'Door-to-door', total:4.9, currency:'EUR' },
      { id:'locker', label:'Locker',       total:3.9, currency:'EUR' }
    ]});
  }),
  http.post('/api/shipping/rates', async ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('fail') === 'rate') {
      return new HttpResponse(JSON.stringify({ code:'CHECKOUT_RATE_UNAVAILABLE', userMessage:'temporary unavailable' }),
        { status:503, headers:{'Content-Type':'application/json'} });
    }
    return HttpResponse.json({ ok:true, rates:[
      { id:'door',   label:'Door-to-door', total:4.9, currency:'EUR' },
      { id:'locker', label:'Locker',       total:3.9, currency:'EUR' }
    ]});
  }),
];
