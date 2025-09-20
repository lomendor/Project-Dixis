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
        id: 'order_123',
        total: 34.50,
        status: 'pending' as const,
        created_at: new Date().toISOString()
      }
    })
  })
]

// Enhanced error scenarios for resilience testing
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

// Rate limiting scenarios
let requestCount = 0
export const rateLimitHandlers = [
  http.get(`${API_BASE}/cart/items`, () => {
    requestCount++
    if (requestCount > 5) {
      return HttpResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    return HttpResponse.json({ cart_items: [], total_items: 0, total_amount: '0.00' })
  })
]

// Network partition scenarios
export const networkPartitionHandlers = [
  // Cart loads but checkout fails (partial failure)
  http.get(`${API_BASE}/cart/items`, () => {
    return HttpResponse.json({ cart_items: [{ id: 1, product: { id: 1, name: 'Product', price: '10.00' }, quantity: 1, subtotal: '10.00' }], total_items: 1, total_amount: '10.00' })
  }),
  http.post(`${API_BASE}/orders/checkout`, () => {
    return HttpResponse.json({ error: 'Network partition' }, { status: 503 })
  })
]

// Greek postal code edge cases  
export const greekPostalHandlers = [
  // Remote islands with higher shipping costs
  http.post(`${API_BASE}/shipping/quote`, async ({ request }) => {
    const body = await request.json() as { destination: { postal_code: string } }
    const postalCode = body.destination.postal_code
    
    // Remote islands
    if (['19010', '23086', '63086', '83103'].includes(postalCode)) {
      return HttpResponse.json({
        shipping_methods: [{ id: 'island', name: 'Island Express', price: 12.50, estimated_days: 5 }]
      })
    }
    
    // Invalid postal codes
    if (['00000', '99999', '12345'].includes(postalCode)) {
      return HttpResponse.json({ error: 'Invalid postal code' }, { status: 400 })
    }
    
    // Default Athens metro
    return HttpResponse.json({
      shipping_methods: [{ id: 'standard', name: 'Standard', price: 3.50, estimated_days: 2 }]
    })
  })
]

// Circuit breaker test handlers
export const circuitBreakerTestHandlers = [
  // Alternating success/failure for circuit breaker testing
  http.get(`${API_BASE}/cart/items`, () => {
    const shouldFail = Math.random() > 0.7 // 30% failure rate
    if (shouldFail) {
      return HttpResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }
    return HttpResponse.json({ cart_items: [], total_items: 0, total_amount: '0.00' })
  })
]