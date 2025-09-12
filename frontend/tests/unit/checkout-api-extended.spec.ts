/**
 * Extended Checkout API Tests - Essential Coverage Only
 * Focused test coverage within LOC budget constraints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse, delay } from 'msw'
import { checkoutApi, categorizeError, retryWithBackoff } from '../../src/lib/api/checkout'
import { checkoutHandlers } from '../msw/checkout.handlers'

const API_BASE = 'http://127.0.0.1:8001/api/v1'
const server = setupServer(...checkoutHandlers)

describe('Checkout API Resilience', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
    vi.useFakeTimers()
  })

  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Error Categorization', () => {
    it('categorizes errors correctly', () => {
      expect(categorizeError(new Error('Network request failed'))).toBe('network')
      expect(categorizeError(new Error('Request timeout'))).toBe('timeout')
      expect(categorizeError(new Error('HTTP 400: Bad request'))).toBe('validation')
      expect(categorizeError(new Error('HTTP 500: Internal error'))).toBe('server')
      expect(categorizeError(new Error('Something weird'))).toBe('unknown')
    })
  })

  describe('Retry Logic', () => {
    it('succeeds on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const result = await retryWithBackoff(mockFn, { retries: 2, baseMs: 100 })
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('retries then succeeds', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success')
      
      const promise = retryWithBackoff(mockFn, { retries: 2, baseMs: 100, jitter: false })
      
      // Advance timers to trigger the retry after first failure
      await vi.advanceTimersByTimeAsync(100)
      
      const result = await promise
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('respects abort signal', async () => {
      const controller = new AbortController()
      const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
      controller.abort()
      
      await expect(
        retryWithBackoff(mockFn, { abortSignal: controller.signal })
      ).rejects.toThrow('Request aborted')
    })
  })

  describe('Greek Postal Codes', () => {
    it('handles Athens metro rates', async () => {
      const result = await checkoutApi.getShippingQuote({
        items: [{ product_id: 1, quantity: 1 }],
        destination: { postal_code: '10671', city: 'Athens' }
      })
      expect(result.success).toBe(true)
      expect(result.data?.[0].price).toBe(3.5)
    })

    it('handles islands rates', async () => {
      const result = await checkoutApi.getShippingQuote({
        items: [{ product_id: 1, quantity: 1 }],
        destination: { postal_code: '84100', city: 'Hermoupolis' }
      })
      expect(result.success).toBe(true)
      expect(result.data?.[0].price).toBe(8.0)
    })

    it('validates postal format', async () => {
      const result = await checkoutApi.getShippingQuote({
        items: [{ product_id: 1, quantity: 1 }],
        destination: { postal_code: '123', city: 'Invalid' }
      })
      expect(result.success).toBe(false)
      expect(result.errors[0].field).toBe('destination.postal_code')
    })
  })

  describe('Network Scenarios', () => {
    it('handles server errors', async () => {
      server.use(
        http.post(`${API_BASE}/orders/checkout`, () => 
          HttpResponse.json({ error: 'Server error' }, { status: 500 })
        )
      )

      const checkoutForm = {
        customer: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '2101234567' },
        shipping: { address: 'Test St', city: 'Athens', postalCode: '10671' },
        order: {
          items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'P' }],
          subtotal: 10, shipping_cost: 3, payment_fees: 0, tax_amount: 0, total_amount: 13,
          shipping_method: { id: 'standard', name: 'Standard', price: 3, estimated_days: 2 },
          payment_method: { id: 'card', type: 'card' as const, name: 'Card' }
        },
        session_id: 'test_session',
        terms_accepted: true
      }

      const result = await checkoutApi.processValidatedCheckout(checkoutForm)
      expect(result.success).toBe(false)
      expect(categorizeError(new Error('HTTP 500'))).toBe('server')
    })

    it('validates responses', async () => {
      const result = await checkoutApi.getValidatedCart()
      expect(result.success).toBe(true)
      expect(result.validationProof).toBe('Cart validated')
    })
  })

  describe('Performance', () => {
    it('handles concurrent operations', async () => {
      const operations = [
        checkoutApi.getValidatedCart(),
        checkoutApi.getValidatedCart(),
        checkoutApi.getValidatedCart()
      ]

      const results = await Promise.all(operations)
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
      })
    })
  })
})