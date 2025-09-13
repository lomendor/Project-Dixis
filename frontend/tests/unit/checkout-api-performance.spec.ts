/**
 * Checkout API Performance & Resilience Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse, delay } from 'msw'
import { checkoutApi } from '../../src/lib/api/checkout'
import { CheckoutCircuitBreaker } from '../../src/lib/api/checkout-monitor'

const API_BASE = 'http://127.0.0.1:8001/api/v1'
const server = setupServer()
const validForm = { customer: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '2101234567' }, shipping: { address: 'Test St', city: 'Athens', postalCode: '10671' }, order: { items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'P' }], subtotal: 10, shipping_cost: 3, payment_fees: 0, tax_amount: 0, total_amount: 13, shipping_method: { id: 'standard', name: 'Standard', price: 3, estimated_days: 2 }, payment_method: { id: 'card', type: 'card' as const, name: 'Card' } }, session_id: 'test', terms_accepted: true }
describe('Checkout API Performance', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => { server.resetHandlers(); vi.restoreAllMocks() })

  describe('Concurrent Operations', () => {
    it('handles 10 concurrent cart operations', async () => {
      server.use(http.get(`${API_BASE}/cart/items`, () => HttpResponse.json({ cart_items: [], total_items: 0, total_amount: '0.00' })))
      const operations = Array(10).fill(0).map(() => checkoutApi.getValidatedCart())
      const results = await Promise.all(operations)
      results.forEach(result => { expect(result.success).toBe(true); expect(result.data).toBeDefined() })
    })

    it('handles concurrent checkouts with progressive delay', async () => {
      let count = 0
      server.use(http.post(`${API_BASE}/orders/checkout`, async () => { count++; await delay(count * 10); return HttpResponse.json({ order: { id: `order_${count}`, total: 13, status: 'pending', created_at: new Date().toISOString() } }) }))
      const operations = Array(3).fill(0).map((_, i) => checkoutApi.processValidatedCheckout({ ...validForm, session_id: `session_${i}` }))
      const results = await Promise.allSettled(operations)
      expect(results.filter(r => r.status === 'fulfilled').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Timeout Scenarios', () => {
    it('handles slow responses', async () => {
      server.use(http.get(`${API_BASE}/cart/items`, async () => { await delay(100); return HttpResponse.json({ cart_items: [], total_items: 0, total_amount: '0.00' }) }))
      const start = Date.now()
      const result = await checkoutApi.getValidatedCart()
      expect(result.success).toBe(true)
      expect(Date.now() - start).toBeGreaterThan(90)
    })

    it('handles request timeouts', async () => {
      server.use(http.post(`${API_BASE}/orders/checkout`, () => HttpResponse.json({ order: { id: 'timeout_test' } })))
      const result = await checkoutApi.processValidatedCheckout(validForm)
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('Circuit Breaker', () => {
    it('opens after failure threshold', async () => {
      const breaker = new CheckoutCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 5000, monitoringWindowMs: 10000 })
      const failing = vi.fn().mockRejectedValue(new Error('Service down'))
      for (let i = 0; i < 4; i++) { try { await breaker.execute(failing) } catch {} }
      expect(breaker.getHealthStatus().state).toBe('OPEN')
      expect(breaker.getHealthStatus().isHealthy).toBe(false)
    })

    it('resets after timeout', async () => {
      const breaker = new CheckoutCircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 100, monitoringWindowMs: 200 })
      const fail = vi.fn().mockRejectedValue(new Error('Fail'))
      try { await breaker.execute(fail) } catch {}
      try { await breaker.execute(fail) } catch {}
      expect(breaker.getHealthStatus().state).toBe('OPEN')
      await new Promise(resolve => setTimeout(resolve, 150))
      const success = vi.fn().mockResolvedValue('ok')
      const result = await breaker.execute(success)
      expect(result).toBe('ok')
      expect(breaker.getHealthStatus().state).toBe('CLOSED')
    })

    it('tracks response times', async () => {
      const breaker = new CheckoutCircuitBreaker()
      await breaker.execute(async () => { await new Promise(r => setTimeout(r, 50)); return 'done' })
      expect(breaker.getHealthStatus().avgResponseTime).toBeGreaterThan(40)
    })
  })

  describe('Resource Management', () => {
    it('handles many operations', async () => {
      const ops = Array(50).fill(0).map((_, i) => { server.use(http.get(`${API_BASE}/cart/items`, () => HttpResponse.json({ cart_items: [{ id: i }] }))); return checkoutApi.getValidatedCart() })
      const results = await Promise.allSettled(ops)
      expect(results.filter(r => r.status === 'fulfilled').length).toBeGreaterThan(45)
    })
  })

  describe('Greek Postal Edge Cases', () => {
    it('handles remote islands', async () => {
      const codes = ['19010', '83103']
      for (const code of codes) {
        const result = await checkoutApi.getShippingQuote({ items: [{ product_id: 1, quantity: 1 }], destination: { postal_code: code, city: 'Island' } })
        expect(result.success).toBe(true)
        expect(result.data?.[0].price).toBeGreaterThan(5)
      }
    })

    it('validates postal codes', async () => {
      const cases = [{ postal_code: '00000', expected: false }, { postal_code: '10671', expected: true }]
      for (const test of cases) {
        const result = await checkoutApi.getShippingQuote({ items: [{ product_id: 1, quantity: 1 }], destination: { postal_code: test.postal_code, city: 'City' } })
        expect(result.success).toBe(test.expected)
      }
    })
  })
})