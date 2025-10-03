import { http, HttpResponse } from 'msw';

/**
 * Pruned MSW handlers - Minimal, targeted handlers for failing tests
 * These handlers take priority over generated handlers for specific test scenarios
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

export const handlersPruned = [
  // GDPR Data Export - SEC-DSR-001 tests
  http.post('/api/dsr/export', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        user_info: {
          id: 'user_test_123',
          name: 'Γιώργος Παπαδόπουλος',
          email: 'test@example.gr',
          created_at: '2024-01-01T00:00:00Z'
        },
        addresses: [
          {
            id: 1,
            street: 'Ακαδημίας 42',
            city: 'Αθήνα',
            postal_code: '10671',
            region: 'Αττική',
            country: 'Ελλάδα'
          }
        ],
        orders: [
          {
            id: 'order_1',
            total: 45.90,
            status: 'completed',
            created_at: '2024-01-15T10:30:00Z',
            items: []
          }
        ],
        preferences: {
          language: 'el',
          marketing_consent: false
        },
        behavioral_data: {
          page_views: 42,
          last_login: '2024-01-20T15:30:00Z'
        },
        export_metadata: {
          generated_at: new Date().toISOString(),
          format_version: '1.0',
          legal_basis: ['GDPR Article 15', 'GDPR Article 20']
        },
        messages: []
      }
    });
  }),

  // GDPR Data Deletion - SEC-DSR-001 tests
  http.post('/api/dsr/delete', async () => {
    return new HttpResponse(null, { status: 202 });
  }),

  // Producer status check
  http.get('/api/producer/status', () =>
    HttpResponse.json({
      authenticated: true,
      role: 'producer',
      isProducer: true,
      status: 'active'
    })
  ),

  // Cart operations
  http.post('/api/cart', async () =>
    HttpResponse.json({
      ok: true,
      items: [],
      total: 0
    })
  ),

  http.get(`${API_BASE}/cart/items`, () => {
    return HttpResponse.json({
      cart_items: [],
      total_items: 0,
      total_amount: '0.00'
    });
  }),

  // Checkout operations
  http.post('/api/checkout', async () =>
    HttpResponse.json({
      ok: true,
      orderId: 'ord_test_1'
    })
  ),

  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({
      order: {
        id: 'order_123',
        total: 34.50,
        status: 'pending' as const,
        created_at: new Date().toISOString()
      }
    });
  }),

  // Shipping operations
  http.post('/api/shipping/rates', async () =>
    HttpResponse.json({
      rates: [
        {
          id: 'door',
          label: 'Door-to-door',
          total: 4.9,
          currency: 'EUR',
          estimated_days: 2
        }
      ]
    })
  ),

  http.post(`${API_BASE}/shipping/quote`, async ({ request }) => {
    const body = await request.json() as any;
    const postalCode = body.destination?.postal_code || '10671';

    // Remote islands with higher costs
    if (['19010', '23086', '63086', '83103'].includes(postalCode)) {
      return HttpResponse.json({
        shipping_methods: [
          {
            id: 'island',
            name: 'Island Express',
            price: 12.50,
            estimated_days: 5
          }
        ]
      });
    }

    // Invalid postal codes
    if (['00000', '99999', '12345'].includes(postalCode)) {
      return HttpResponse.json(
        { error: 'Invalid postal code' },
        { status: 400 }
      );
    }

    // Default Athens metro
    return HttpResponse.json({
      shipping_methods: [
        {
          id: 'standard',
          name: 'Standard',
          price: 3.50,
          estimated_days: 2
        }
      ]
    });
  }),

  // Payment intent
  http.post('/api/payment_intent', async () =>
    HttpResponse.json({
      client_secret: 'pi_test_123',
      id: 'pi_test_123'
    })
  ),

  http.post(`${API_BASE}/payment`, () =>
    HttpResponse.json({
      client_secret: 'pi_test_client_secret'
    })
  ),
];
