import { http, HttpResponse, delay } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1'

// Test scenarios for checkout API
export const checkoutHandlers = [
  // Success: Valid cart (matches API client cart/items endpoint)
  http.get(`${API_BASE}/cart/items`, () => {
    return HttpResponse.json({
      cart_items: [{
        id: 1,
        product: { id: 1, name: 'Test Product', price: '15.50', producer: { name: 'Test Producer' } },
        quantity: 2,
        subtotal: '31.00'
      }],
      total_items: 2,
      total_amount: '31.00'
    })
  }),

  // Success: Checkout completion  
  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({
      order: {
        id: 'order_12345',
        total: 34.50,
        status: 'pending' as const,
        created_at: new Date().toISOString()
      }
    })
  })
]

// Error scenarios for testing
export const checkoutErrorHandlers = [
  // Network timeout simulation
  http.get(`${API_BASE}/cart/items`, async () => {
    await delay(5000) // Longer than typical timeout
    return HttpResponse.json({ cart_items: [] })
  }),

  // Server error
  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
  }),

  // Validation error
  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({ 
      errors: [{ field: 'email', message: 'Invalid email format' }] 
    }, { status: 400 })
  })
]