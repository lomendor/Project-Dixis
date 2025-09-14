/**
 * Checkout API Resilience Tests - Comprehensive Coverage
 * Tests retry logic, error categorization, and timeout handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { checkoutApi, CheckoutApiClient } from '../../src/lib/api/checkout';
import { apiUrl } from '../../src/lib/api';

// MSW server for API mocking
const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.clearAllMocks();
  // Mock console.warn to track retry attempts
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  server.resetHandlers();
  server.close();
  vi.restoreAllMocks();
});

// Mock data matching Laravel API structure
const mockCartResponse = {
  items: [{
    id: 1,
    product: {
      id: 1,
      name: 'Test Product',
      price: '12.50',
      producer: { name: 'Test Producer' }
    },
    quantity: 2,
    subtotal: '25.00'
  }],
  total_items: 1,
  total_amount: '25.00'
};

const mockOrderResponse = {
  id: 'order_123',
  total: 25.00,
  status: 'pending' as const,
  created_at: '2024-01-01T10:00:00Z'
};

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

      const checkoutForm = {
        customer: {
          firstName: 'John',
          lastName: 'Doe', 
          email: 'john@test.com',
          phone: '2101234567'
        },
        shipping: {
          address: 'Test Street 123',
          city: 'Athens',
          postalCode: '10671',
          notes: ''
        },
        order: {
          items: [{
            id: 1,
            product_id: 1,
            name: 'Test Product',
            price: 12.50,
            quantity: 2,
            subtotal: 25.00,
            producer_name: 'Test Producer'
          }],
          subtotal: 25.00,
          shipping_cost: 5.00,
          payment_fees: 0,
          tax_amount: 6.00,
          total_amount: 36.00,
          shipping_method: {
            id: 'standard',
            name: 'Standard Delivery',
            price: 5.00,
            estimated_days: 3
          },
          payment_method: {
            id: 'card',
            type: 'card' as const,
            name: 'Credit Card'
          }
        },
        session_id: 'test_session',
        terms_accepted: true
      };

      const result = await checkoutApi.processValidatedCheckout(checkoutForm);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('order_123');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('calculates shipping quote successfully', async () => {
      const quoteRequest = {
        items: [{ product_id: 1, quantity: 2 }],
        destination: { postal_code: '10671', city: 'Athens' }
      };

      const result = await checkoutApi.getShippingQuote(quoteRequest);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Standard and Express shipping
      expect(result.data![0]).toMatchObject({
        id: 'standard',
        name: 'Κανονική Παράδοση',
        price: expect.any(Number),
        estimated_days: 4
      });
      expect(result.data![1]).toMatchObject({
        id: 'express', 
        name: 'Ταχεία Παράδοση',
        estimated_days: 1
      });
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
      expect(console.warn).toHaveBeenCalledTimes(2); // 2 retry attempts
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/🔄 Retry 1\/3 for getValidatedCart after \d+ms/)
      );
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
      const result = await checkoutApi.processValidatedCheckout({
        customer: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '2101234567' },
        shipping: { address: 'Test St', city: 'Athens', postalCode: '10671' },
        order: {
          items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'Test' }],
          subtotal: 10,
          shipping_cost: 5,
          payment_fees: 0,
          tax_amount: 2,
          total_amount: 17,
          shipping_method: { id: 'standard', name: 'Standard', price: 5, estimated_days: 3 },
          payment_method: { id: 'card', type: 'card' as const, name: 'Card' }
        },
        session_id: 'test',
        terms_accepted: true
      });
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2);
      expect(duration).toBeGreaterThan(1000); // Should have delayed
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/🔄 Retry 1\/2 for processValidatedCheckout after \d+ms/)
      );
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
        items: [{
          id: 1,
          product: {
            id: 'invalid', // Should be number
            name: '',      // Should not be empty
            price: 'invalid', // Should be valid number string
            producer: { name: '' } // Should not be empty
          },
          quantity: -1,    // Should be positive
          subtotal: 'invalid' // Should be valid number string
        }]
      };

      server.use(
        http.get(apiUrl('cart/items'), () => HttpResponse.json(invalidCartResponse))
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0); // Has validation errors
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/items\.0\./),
            code: 'VALIDATION_ERROR'
          })
        ])
      );
    });

    it('validates checkout form structure', async () => {
      const invalidCheckoutForm = {
        customer: {
          firstName: '',    // Required
          email: 'invalid', // Invalid format
          phone: '123'      // Invalid Greek phone
        },
        shipping: {
          postalCode: '123', // Invalid Greek postal code
          city: ''           // Required
        }
        // Missing required fields: order, session_id, terms_accepted
      };

      const result = await checkoutApi.processValidatedCheckout(invalidCheckoutForm);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'VALIDATION_ERROR'
          })
        ])
      );
    });

    it('validates shipping quote request format', async () => {
      const invalidQuoteRequest = {
        items: [{ product_id: 'invalid', quantity: -1 }],
        destination: { postal_code: '123', city: '' }
      };

      const result = await checkoutApi.getShippingQuote(invalidQuoteRequest);
      
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/items\.0\.|destination\./),
            code: 'VALIDATION_ERROR'
          })
        ])
      );
    });
  });

  describe('Network & Timeout Handling', () => {
    it('handles timeout errors properly', async () => {
      // Mock fetch timeout directly
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('timeout'));

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Timeout - δοκιμάστε ξανά');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');

      global.fetch = originalFetch;
    });

    it('handles network connection errors', async () => {
      server.use(
        http.get(apiUrl('cart/items'), () => {
          throw new Error('Network error');
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Πρόβλημα σύνδεσης');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });

    it('stops retrying non-retryable errors', async () => {
      let attemptCount = 0;
      server.use(
        http.get(apiUrl('cart/items'), () => {
          attemptCount++;
          return new HttpResponse(null, { status: 400 }); // Validation error - non-retryable
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(attemptCount).toBe(1); // Should not retry validation errors
      expect(result.errors[0].message).toBe('Μη έγκυρα δεδομένα');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('Error Categorization', () => {
    it('categorizes authentication errors correctly', async () => {
      server.use(
        http.post(apiUrl('orders/checkout'), () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      const result = await checkoutApi.processValidatedCheckout({
        customer: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '2101234567' },
        shipping: { address: 'Test', city: 'Athens', postalCode: '10671' },
        order: {
          items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'Test' }],
          subtotal: 10,
          shipping_cost: 5, 
          payment_fees: 0,
          tax_amount: 2,
          total_amount: 17,
          shipping_method: { id: 'standard', name: 'Standard', price: 5, estimated_days: 3 },
          payment_method: { id: 'card', type: 'card' as const, name: 'Card' }
        },
        session_id: 'test',
        terms_accepted: true
      });
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Μη εξουσιοδοτημένος');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });

    it('categorizes server errors as retryable', async () => {
      server.use(
        http.get(apiUrl('cart/items'), () => {
          return new HttpResponse(null, { status: 503 }); // Service unavailable
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toBe('Πρόβλημα διακομιστή');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });

  describe('Business Logic Validation', () => {
    it('validates Greek postal code and city matching', async () => {
      const checkoutForm = {
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com', 
          phone: '2101234567'
        },
        shipping: {
          address: 'Test Street',
          city: 'Thessaloniki',  // Doesn't match Athens postal code
          postalCode: '10671'    // Athens postal code
        },
        order: {
          items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'Test' }],
          subtotal: 10,
          shipping_cost: 5,
          payment_fees: 0, 
          tax_amount: 2,
          total_amount: 17,
          shipping_method: { id: 'standard', name: 'Standard', price: 5, estimated_days: 3 },
          payment_method: { id: 'card', type: 'card' as const, name: 'Card' }
        },
        session_id: 'test_session',
        terms_accepted: true
      };

      const result = await checkoutApi.processValidatedCheckout(checkoutForm);
      
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'city',
            message: 'Η πόλη δεν αντιστοιχεί στον ΤΚ',
            code: 'MISMATCH'
          })
        ])
      );
    });
  });
});