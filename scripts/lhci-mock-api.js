const http = require('http');
const url = require('url');
const products = require('../frontend/fixtures/products.json');

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);
  // basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }

  if (pathname === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok: true }));
  }
  if (pathname.startsWith('/api/v1/products')) {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify(products));
  }
  // generic fallback
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ success:true, data:[] }));
});

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4010;
server.listen(PORT, () => console.log('LHCI mock API on', PORT));