/**
 * Core Unit Tests for Checkout API Client with MSW
 * Tests all three functions: getValidatedCart, getShippingQuote, processValidatedCheckout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { checkoutApi } from '../../src/lib/api/checkout';
import { apiUrl } from '../../src/lib/api';

// MSW server setup for API mocking
const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe('CheckoutApiClient Core Functions', () => {
  describe('getValidatedCart()', () => {
    it('validates cart items successfully with proper data', async () => {
      const mockCartResponse = {
        cart_items: [{
          id: 1,
          product: {
            id: 1,
            name: 'Greek Olive Oil',
            price: '15.50',
            producer: { name: 'Aegean Producers' }
          },
          quantity: 2,
          subtotal: '31.00'
        }],
        total_items: 2,
        total_amount: '31.00'
      };

      server.use(
        http.get(apiUrl('cart/items'), () => {
          return HttpResponse.json(mockCartResponse);
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toMatchObject({
        product_id: 1,
        name: 'Greek Olive Oil',
        price: 15.50,
        quantity: 2,
        subtotal: 31.00,
        producer_name: 'Aegean Producers'
      });
      expect(result.validationProof).toBe('Cart validated');
    });

    it('handles invalid cart data gracefully', async () => {
      const invalidCartResponse = {
        cart_items: [{
          id: 'invalid',
          product: { id: 'bad', name: '', price: 'invalid' },
          quantity: -1,
          subtotal: 'bad'
        }],
        total_items: 1,
        total_amount: '0.00'
      };

      server.use(
        http.get(apiUrl('cart/items'), () => {
          return HttpResponse.json(invalidCartResponse);
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(5); // multiple validation errors
      expect(result.validationProof).toBe('Cart validated');
    });

    it('handles network errors appropriately', async () => {
      server.use(
        http.get(apiUrl('cart/items'), () => {
          return HttpResponse.error();
        })
      );

      const result = await checkoutApi.getValidatedCart();
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Πρόβλημα σύνδεσης');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });

  describe('getShippingQuote()', () => {
    it('validates shipping quote request and returns methods', async () => {
      const validRequest = {
        items: [{ product_id: 1, quantity: 2 }],
        destination: { postal_code: '10671', city: 'Athens' }
      };

      const mockQuoteResponse = {
        data: [{
          id: 'home_delivery',
          name: 'Home Delivery',
          description: 'Delivery to your door',
          price: 5.50,
          estimated_days: 2,
          available_for_postal_codes: ['10']
        }]
      };

      server.use(
        http.post(apiUrl('shipping/quote'), () => {
          return HttpResponse.json(mockQuoteResponse);
        })
      );

      const result = await checkoutApi.getShippingQuote(validRequest);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toMatchObject({
        id: 'home_delivery',
        name: 'Home Delivery',
        price: 5.50,
        estimated_days: 2
      });
      expect(result.validationProof).toContain('Shipping quote validated: 1 methods');
    });

    it('rejects invalid shipping request data', async () => {
      const invalidRequest = {
        items: [], // empty items array
        destination: { postal_code: '123', city: 'A' } // invalid postal code and city
      };

      const result = await checkoutApi.getShippingQuote(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3); // items, postal_code, city errors
      expect(result.validationProof).toBe('Quote request validation failed');
    });

    it('handles shipping API errors gracefully', async () => {
      const validRequest = {
        items: [{ product_id: 1, quantity: 1 }],
        destination: { postal_code: '10671', city: 'Athens' }
      };

      server.use(
        http.post(apiUrl('shipping/quote'), () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await checkoutApi.getShippingQuote(validRequest);
      
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Προσωρινό πρόβλημα');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });

  describe('validateOrderSummary()', () => {
    it('validates complete order summary correctly', () => {
      const validOrderSummary = {
        items: [{
          id: 1,
          product_id: 1,
          name: 'Greek Honey',
          price: 12.50,
          quantity: 2,
          subtotal: 25.00,
          producer_name: 'Mountain Producers'
        }],
        subtotal: 25.00,
        shipping_method: {
          id: 'home_delivery',
          name: 'Home Delivery',
          price: 4.50,
          estimated_days: 3
        },
        shipping_cost: 4.50,
        payment_method: {
          id: 'card',
          type: 'card' as const,
          name: 'Credit Card'
        },
        payment_fees: 0.75,
        tax_amount: 6.05,
        total_amount: 36.30
      };

      const result = checkoutApi.validateOrderSummary(validOrderSummary);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validOrderSummary);
      expect(result.validationProof).toBe('Order valid');
    });

    it('detects calculation errors in totals', () => {
      const invalidOrderSummary = {
        items: [{
          id: 1, product_id: 1, name: 'Test', price: 10.00,
          quantity: 2, subtotal: 20.00, producer_name: 'Producer'
        }],
        subtotal: 15.00, // Wrong subtotal (should be 20.00)
        shipping_method: { id: 'home', name: 'Home', price: 3.00, estimated_days: 2 },
        shipping_cost: 3.00,
        payment_method: { id: 'card', type: 'card' as const, name: 'Card' },
        payment_fees: 0, tax_amount: 0,
        total_amount: 100.00 // Wrong total
      };

      const result = checkoutApi.validateOrderSummary(invalidOrderSummary);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2); // subtotal + total errors
      expect(result.validationProof).toBe('Totals invalid');
    });
  });

  describe('processValidatedCheckout()', () => {
    it('processes complete checkout successfully', async () => {
      const validCheckout = {
        customer: {
          firstName: 'Dimitrios',
          lastName: 'Papadopoulos', 
          email: 'dimitrios@example.gr',
          phone: '2101234567'
        },
        shipping: {
          address: 'Voukourestiou 25',
          city: 'Athens',
          postalCode: '10671',
          notes: 'Ring doorbell twice'
        },
        order: {
          items: [{
            id: 1, product_id: 1, name: 'Feta Cheese', price: 8.50,
            quantity: 1, subtotal: 8.50, producer_name: 'Cretan Producers'
          }],
          subtotal: 8.50, shipping_cost: 3.50, payment_fees: 0, tax_amount: 2.04,
          total_amount: 14.04,
          shipping_method: { id: 'courier', name: 'Courier', price: 3.50, estimated_days: 1 },
          payment_method: { id: 'cod', type: 'cash_on_delivery' as const, name: 'Cash on Delivery' }
        },
        session_id: 'sess_12345',
        terms_accepted: true,
        marketing_consent: false
      };

      const mockOrderResponse = {
        order: {
          id: 'order_67890',
          total_amount: '14.04',
          status: 'pending',
          created_at: '2025-01-15T10:30:00Z'
        }
      };

      server.use(
        http.post(apiUrl('orders/checkout'), () => {
          return HttpResponse.json(mockOrderResponse);
        })
      );

      const result = await checkoutApi.processValidatedCheckout(validCheckout);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('order_67890');
      expect(result.validationProof).toContain('Order order_67890 created');
    });

    it('rejects checkout with validation errors', async () => {
      const invalidCheckout = {
        customer: { firstName: '', lastName: '', email: 'invalid', phone: '123' },
        shipping: { address: '', city: '', postalCode: '123' },
        order: { items: [], subtotal: 0, total_amount: 0 },
        session_id: '',
        terms_accepted: false
      };

      const result = await checkoutApi.processValidatedCheckout(invalidCheckout);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
      expect(result.validationProof).toBe('Form invalid');
    });
  });
});