/**
 * Checkout API Resilience Tests - Core Coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { checkoutApi } from '../../src/lib/api/checkout';
import { apiUrl } from '../../src/lib/api';
import { 
  server, 
  mockCartResponse, 
  mockOrderResponse, 
  mockCheckoutForm,
  createErrorHandler,
  createSuccessHandler
} from './helpers/api-mocks';

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.clearAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  server.resetHandlers();
  server.close();
  vi.restoreAllMocks();
});

describe('CheckoutApiClient Resilience', () => {
  describe('Success Scenarios', () => {
    it('validates cart successfully on first attempt', async () => {
      server.use(
        http.get(apiUrl('cart/items'), () => HttpResponse.json(mockCartResponse))
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        product_id: 1,
        name: 'Test Product',
        price: 12.50,
        quantity: 2,
        subtotal: 25.00,
        producer_name: 'Test Producer'
      });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('processes checkout successfully on first attempt', async () => {
      server.use(
        http.post(apiUrl('orders/checkout'), () => HttpResponse.json(mockOrderResponse))
      );

      const result = await checkoutApi.processValidatedCheckout(mockCheckoutForm);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('order_123');
    });

    it('calculates shipping quote successfully', async () => {
      const result = await checkoutApi.getShippingQuote({
        items: [{ product_id: 1, quantity: 2 }],
        destination: { postal_code: '10671', city: 'Athens' }
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Retry Logic', () => {
    it('retries network errors and eventually succeeds', async () => {
      let attemptCount = 0;
      server.use(
        http.get(apiUrl('cart/items'), () => {
          attemptCount++;
          if (attemptCount < 3) {
            return HttpResponse.error(); // Network error
          }
          return HttpResponse.json(mockCartResponse);
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('retries server errors with exponential backoff', async () => {
      let attemptCount = 0;
      server.use(
        http.post(apiUrl('orders/checkout'), () => {
          attemptCount++;
          if (attemptCount < 2) {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json(mockOrderResponse);
        })
      );

      const startTime = Date.now();
      const result = await checkoutApi.processValidatedCheckout(mockCheckoutForm);
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2);
      expect(duration).toBeGreaterThan(1000);
    });

    it('handles rate limiting with proper delay', async () => {
      server.use(
        http.get(apiUrl('cart/items'), () => {
          return new HttpResponse(null, { status: 429 });
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Πολλές αιτήσεις - περιμένετε');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });

  describe('Validation Errors', () => {
    it('handles cart validation errors', async () => {
      const invalidCartResponse = {
        items: [{ id: 1, product: { id: 'invalid', name: '', price: 'invalid', producer: { name: '' } }, quantity: -1, subtotal: 'invalid' }]
      };

      server.use(createSuccessHandler('cart/items', invalidCartResponse));

      const result = await checkoutApi.getValidatedCart();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates checkout form structure', async () => {
      const result = await checkoutApi.processValidatedCheckout({ customer: { firstName: '', email: 'invalid' }, shipping: { city: '' } });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });

    it('validates shipping quote request format', async () => {
      const result = await checkoutApi.getShippingQuote({ items: [{ product_id: 'invalid', quantity: -1 }], destination: { postal_code: '123' } });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Network & Error Handling', () => {
    it('handles timeout errors properly', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('timeout'));
      const result = await checkoutApi.getValidatedCart();
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
      global.fetch = originalFetch;
    });

    it('stops retrying non-retryable errors', async () => {
      let attemptCount = 0;
      server.use(
        http.get(apiUrl('cart/items'), () => {
          attemptCount++;
          return new HttpResponse(null, { status: 400 });
        })
      );
      const result = await checkoutApi.getValidatedCart();
      expect(result.success).toBe(false);
      expect(attemptCount).toBe(1);
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });
  });


  describe('Business Logic Validation', () => {
    it('validates Greek postal code and city matching', async () => {
      const invalidForm = { ...mockCheckoutForm, shipping: { ...mockCheckoutForm.shipping, city: 'Thessaloniki' } };
      const result = await checkoutApi.processValidatedCheckout(invalidForm);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('MISMATCH');
    });
  });
});