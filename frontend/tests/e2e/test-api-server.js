const http = require('http'); const url = require('url');
const PORT = process.env.TEST_API_PORT ? Number(process.env.TEST_API_PORT) : 8001;
const json = (res, code, obj) => { res.writeHead(code, {'Content-Type':'application/json'}); res.end(JSON.stringify(obj)); };
const notFound = (res) => json(res, 404, {ok:false, error:'not_found'});

function handle(req, res){
  const u = url.parse(req.url, true);
  const path = u.pathname || '/';
  const method = (req.method||'GET').toUpperCase();

  // Health
  if (path === '/health' && method === 'GET') return json(res, 200, {ok:true, ts:Date.now()});

  // Auth/role
  if (path.match(/^\/api\/producer\/status$/) && method === 'GET')
    return json(res, 200, { authenticated: true, role: 'producer' });

  // Products listing (για landing/SSR)
  if (path.match(/^\/api\/v1\/products$/) && method === 'GET')
    return json(res, 200, { items: [{id:'p1', title:'Demo Apples', price: 5.0}, {id:'p2', title:'Demo Oranges', price: 4.0}] });

  // Shipping rates
  if (path.match(/^\/api\/shipping\/rates$/) && method === 'POST')
    return json(res, 200, { ok:true, rates:[{id:'door', label:'Door Delivery', total:4.9, currency:'EUR'}] });

  // Payment intent
  if (path.match(/^\/api\/payment_intent$/) && method === 'POST')
    return json(res, 200, { ok:true, client_secret:'pi_test_123' });

  // Cart validate
  if (path.match(/^\/api\/cart\/validate$/) && method === 'POST')
    return json(res, 200, { success:true, data:[] });

  // Checkout
  if (path.match(/^\/api\/checkout$/) && method === 'POST')
    return json(res, 200, { ok:true, orderId:'ord_test_1', totals:{ items:10.0, shipment:4.9, grand:14.9 } });

  // Fallback
  return json(res, 200, { ok:true });
}

const server = http.createServer(handle);
server.listen(PORT, '127.0.0.1', () => console.log(`[test-api] Listening on http://127.0.0.1:${PORT}`));
process.on('SIGTERM', () => server.close(()=>process.exit(0)));
process.on('SIGINT', () => server.close(()=>process.exit(0)));
