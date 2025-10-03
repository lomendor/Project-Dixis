import { http, HttpResponse } from 'msw';

// Pass 12: Dedicated handlers for shipping quote API with shipping_methods structure
const standardMethods = [
  { id: 'standard', name: 'Standard', label: 'Standard', price: 3.50, total: 3.50, currency: 'EUR', estimated_days: 2 },
  { id: 'express', name: 'Express', label: 'Express', price: 8.90, total: 8.90, currency: 'EUR', estimated_days: 1 }
];

const islandMethods = [
  { id: 'island', name: 'Island Express', label: 'Island Express', price: 12.5, total: 12.5, currency: 'EUR', estimated_days: 5 }
];

export const shippingQuoteHandlers = [
  // Handle POST /api/v1/shipping/quote
  http.post('/api/v1/shipping/quote', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const postalCode = body.destination?.postal_code || body.destination?.zip || body.zip || '';

      // Validate Greek postal code (5 digits)
      if (postalCode && !/^\d{5}$/.test(postalCode)) {
        return new HttpResponse(
          JSON.stringify({ code: 'INVALID_ZIP', userMessage: 'Μη έγκυρος ΤΚ (5 ψηφία)', error: 'Invalid postal code' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check for remote islands based on postal code
      const isRemoteIsland = ['19010', '23086', '63086', '83103', '84100'].includes(postalCode);

      return HttpResponse.json({
        ok: true,
        shipping_methods: isRemoteIsland ? islandMethods : standardMethods
      });
    } catch {
      return HttpResponse.json({ ok: true, shipping_methods: standardMethods });
    }
  }),

  // Handle POST /api/shipping/quote (non-v1 path)
  http.post('/api/shipping/quote', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const postalCode = body.destination?.postal_code || body.destination?.zip || body.zip || '';

      if (postalCode && !/^\d{5}$/.test(postalCode)) {
        return new HttpResponse(
          JSON.stringify({ code: 'INVALID_ZIP', userMessage: 'Μη έγκυρος ΤΚ (5 ψηφία)' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const isRemoteIsland = ['19010', '23086', '63086', '83103', '84100'].includes(postalCode);

      return HttpResponse.json({
        ok: true,
        shipping_methods: isRemoteIsland ? islandMethods : standardMethods
      });
    } catch {
      return HttpResponse.json({ ok: true, shipping_methods: standardMethods });
    }
  }),

  // Handle http://127.0.0.1:8001 full URL variants
  http.post('http://127.0.0.1:8001/api/v1/shipping/quote', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const postalCode = body.destination?.postal_code || '';
      const isRemoteIsland = ['19010', '23086', '63086', '83103', '84100'].includes(postalCode);

      return HttpResponse.json({
        ok: true,
        shipping_methods: isRemoteIsland ? islandMethods : standardMethods
      });
    } catch {
      return HttpResponse.json({ ok: true, shipping_methods: standardMethods });
    }
  })
];
