import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { vus: 3, duration: '30s', thresholds: { http_req_duration: ['p(95)<800'] } };
const BASE = __ENV.BASE_URL || 'https://dixis.gr';
export default function () {
  // 1) list products
  const list = http.get(`${BASE}/api/products`);
  if (list.status !== 200) return;
  const first = (list.json().items || [])[0];
  if (!first) return;
  // 2) cart add using cookies (per VU)
  const jar = http.cookieJar();
  jar.set(BASE, 'cart', '[]');
  const add = http.post(`${BASE}/api/cart`, JSON.stringify({ slug: first.id, qty: 1 }), { headers: { 'Content-Type':'application/json' }});
  check(add, { 'add ok': r => r.status === 200 });
  sleep(1);
}
