import { http, HttpResponse } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1'

// Greek marketplace mock data aligned with api-mocks.ts
const mockProducts = [
  {
    id: 1,
    name: 'Ελαιόλαδο Κρήτης',
    price: '15.50',
    description: 'Premium extra virgin olive oil from Crete',
    producer: { id: 1, name: 'Κρητικός Παραγωγός', region: 'Heraklion' },
    categories: [{ id: 1, name: 'Olive Oil' }],
    in_stock: true,
    stock_quantity: 50
  },
  {
    id: 2,
    name: 'Μέλι Θυμαριού',
    price: '12.00',
    description: 'Pure thyme honey from Greek mountains',
    producer: { id: 2, name: 'Μελισσοκόμος Πάρνηθας', region: 'Attica' },
    categories: [{ id: 2, name: 'Honey' }],
    in_stock: true,
    stock_quantity: 30
  }
]

export const authHandlers = [
  // Auth login endpoint
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      user: { id: 1, name: 'Test User', email: 'test@dixis.local', role: 'consumer' },
      token: 'mock_jwt_token'
    })
  }),

  // Auth me endpoint  
  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      id: 1, name: 'Test User', email: 'test@dixis.local', role: 'consumer', verified: true
    })
  }),

  // Auth profile endpoint
  http.get(`${API_BASE}/auth/profile`, () => {
    return HttpResponse.json({
      id: 1, name: 'Test User', email: 'test@dixis.local', role: 'consumer', verified: true
    })
  }),

  // Cart endpoint with richer structure
  http.get(`${API_BASE}/cart`, () => {
    return HttpResponse.json({ items: [], total: '0.00', subtotal: '0.00', tax: '0.00' })
  }),

  // Products endpoint with pagination structure
  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json({ data: mockProducts, total: mockProducts.length })
  }),

  // Public products endpoint with consistent structure
  http.get(`${API_BASE}/public/products`, () => {
    return HttpResponse.json({ data: mockProducts, total: mockProducts.length })
  }),

  // Orders endpoint
  http.get(`${API_BASE}/orders`, () => {
    return HttpResponse.json([])
  }),

  // Categories endpoint
  http.get(`${API_BASE}/categories`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Olive Oil', slug: 'olive-oil' },
      { id: 2, name: 'Honey', slug: 'honey' },
      { id: 3, name: 'Cheese', slug: 'cheese' }
    ])
  }),

  // Checkout endpoint
  http.post(`${API_BASE}/checkout`, () => {
    return HttpResponse.json({ message: 'Checkout completed successfully', order_id: '12345', total: '15.50' })
  })
]

export const handlers = [...authHandlers]