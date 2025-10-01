import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const server = setupServer(
  http.post('/api/rates', async () => HttpResponse.json({ rates: [{ service:'door', total: 4.9, currency: 'EUR' }] }))
);
