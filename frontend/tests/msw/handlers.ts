import { http, HttpResponse } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1'

export const authHandlers = [
  // Auth login endpoint
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      token: "mock_token",
      role: "consumer", 
      email: "test@dixis.local"
    })
  }),

  // Auth me endpoint  
  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      id: 1,
      role: "consumer",
      email: "test@dixis.local"
    })
  }),

  // Cart endpoint
  http.get(`${API_BASE}/cart`, () => {
    return HttpResponse.json({
      items: []
    })
  }),

  // Products endpoint
  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "Mock Product"
      }
    ])
  }),

  // Public products endpoint (if different)
  http.get(`${API_BASE}/public/products`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "Mock Product"
      }
    ])
  })
]

export const handlers = [...authHandlers]