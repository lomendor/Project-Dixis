import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = { vus: 5, duration: '30s', thresholds: { http_req_duration: ['p(95)<800'] } };
const BASE = __ENV.BASE_URL || 'https://dixis.gr';
export default function () {
  const res = http.get(`${BASE}/api/products`);
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
