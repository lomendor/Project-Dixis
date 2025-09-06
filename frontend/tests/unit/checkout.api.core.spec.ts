/**
 * Checkout API Core Unit Tests
 * Comprehensive Vitest test suite for checkout API client with mocks
 * Tests validation, error handling, and API integration patterns
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkoutApi, CheckoutApiClient, type ValidatedApiResponse } from '../../src/lib/api/checkout';
import { apiClient } from '../../src/lib/api';
import type { CartItem, Order } from '../../src/lib/api';

// Mock the entire API client module
vi.mock('../../src/lib/api', () => ({
  apiClient: {
    getCart: vi.fn(),
    checkout: vi.fn(),
  },
}));

// Mock the validation module
vi.mock('../../src/lib/checkout/checkoutValidation', () => ({
  validatePostalCodeCity: vi.fn(),
}));

describe('CheckoutApiClient', () => {
  let client: CheckoutApiClient;
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    client = new CheckoutApiClient();
    vi.clearAllMocks();
    // Reset console methods to avoid test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getValidatedCart', () => {
    it('should validate and return cart items successfully', async () => {
      // Mock API response
      const mockCartResponse = {
        items: [
          {
            product: {
              id: 1,
              name: 'Ελαιόλαδο Καλαμάτας',
              price: '15.50',
              producer: { name: 'Φάρμα Παπαδόπουλου' }
            },
            quantity: 2,
            subtotal: '31.00'
          }
        ]
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await client.getValidatedCart();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toEqual({
        id: 0,
        product_id: 1,
        name: 'Ελαιόλαδο Καλαμάτας',
        price: 15.50,
        quantity: 2,
        subtotal: 31.00,
        producer_name: 'Φάρμα Παπαδόπουλου'
      });
      expect(result.errors).toHaveLength(0);
      expect(result.validationProof).toContain('Cart validated');
    });

    it('should handle validation errors in cart items', async () => {
      const mockCartResponse = {
        items: [
          {
            product: {
              id: 'invalid', // Should be number
              name: '',       // Should not be empty
              price: '-5.00', // Should be positive
              producer: { name: 'Valid Producer' }
            },
            quantity: 0,      // Should be positive
            subtotal: 'abc'   // Should be number
          }
        ]
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toContain('items.0');
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 500: Server Error'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Προσωρινό πρόβλημα');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
      expect(result.validationProof).toContain('getValidatedCart: 500');
    });
  });

  describe('validateOrderSummary', () => {
    it('should validate correct order summary', () => {
      const validOrderSummary = {
        items: [
          {
            id: 1,
            product_id: 1,
            name: 'Τυρί Φέτα',
            price: 8.50,
            quantity: 1,
            subtotal: 8.50,
            producer_name: 'Τυροκομεία Κρήτης'
          }
        ],
        subtotal: 8.50,
        shipping_method: {
          id: 'standard',
          name: 'Κανονική Παράδοση',
          description: 'Παράδοση σε 3-5 εργάσιμες ημέρες',
          price: 5.0,
          estimated_days: 4
        },
        shipping_cost: 5.0,
        payment_method: {
          id: 'cod',
          type: 'cash_on_delivery',
          name: 'Αντικαταβολή'
        },
        payment_fees: 0.0,
        tax_amount: 1.35,
        total_amount: 14.85
      };

      const result = client.validateOrderSummary(validOrderSummary);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validOrderSummary);
      expect(result.errors).toHaveLength(0);
      expect(result.validationProof).toContain('Order valid');
    });

    it('should reject invalid order summary', () => {
      const invalidOrderSummary = {
        items: [], // Empty cart should fail
        subtotal: -10, // Negative amount should fail
        shipping_cost: 'invalid', // Should be number
        total_amount: 0 // Should be positive
      };

      const result = client.validateOrderSummary(invalidOrderSummary);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.validationProof).toContain('Order validation failed');
    });

    it('should handle validation errors gracefully', () => {
      const result = client.validateOrderSummary(null);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      // When null is passed, Zod returns its standard validation error
      expect(result.errors[0].message).toBe('Expected object, received null');
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getShippingQuote', () => {
    it('should calculate shipping quote for valid request', async () => {
      const quoteRequest = {
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        destination: {
          postal_code: '10681', // Athens
          city: 'Αθήνα'
        }
      };

      const result = await client.getShippingQuote(quoteRequest);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Standard and Express
      expect(result.data![0]).toEqual({
        id: 'standard',
        name: 'Κανονική Παράδοση',
        description: 'Παράδοση σε 3-5 εργάσιμες ημέρες',
        price: 5.0, // Max of (5.0, 1.5 * 1.5kg)
        estimated_days: 4
      });
      expect(result.data![1]).toEqual({
        id: 'express',
        name: 'Ταχεία Παράδοση', 
        description: 'Παράδοση σε 1-2 εργάσιμες ημέρες',
        price: 8.0, // Max of (8.0, 2.5 * 1.5kg)
        estimated_days: 1
      });
      expect(result.validationProof).toContain('Shipping quote calculated for 2 items to Αθήνα');
    });

    it('should reject invalid shipping quote request', async () => {
      const invalidRequest = {
        items: [], // Empty items array
        destination: {
          postal_code: '123', // Invalid format
          city: ''            // Empty city
        }
      };

      const result = await client.getShippingQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.validationProof).toContain('Quote request validation failed');
    });

    it('should handle shipping quote errors gracefully', async () => {
      // Simulate internal error during quote calculation
      vi.spyOn(Math, 'max').mockImplementationOnce(() => {
        throw new Error('Math error');
      });

      const validRequest = {
        items: [{ product_id: 1, quantity: 1 }],
        destination: { postal_code: '10681', city: 'Αθήνα' }
      };

      const result = await client.getShippingQuote(validRequest);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Προσωρινό πρόβλημα');
    });
  });

  describe('processValidatedCheckout', () => {
    it('should process valid checkout successfully', async () => {
      const { validatePostalCodeCity } = await import('../../src/lib/checkout/checkoutValidation');
      vi.mocked(validatePostalCodeCity).mockReturnValue(true);

      const validCheckoutData = {
        customer: {
          firstName: 'Giannis',
          lastName: 'Papadopoulos',
          email: 'giannis@example.com',
          phone: '2101234567'
        },
        shipping: {
          address: 'Panepistimiou 15',
          city: 'Athens',
          postalCode: '10679',
          notes: 'Afternoon delivery'
        },
        order: {
          items: [{
            id: 1, product_id: 1, name: 'Thyme Honey', price: 12.0,
            quantity: 1, subtotal: 12.0, producer_name: 'Cretan Honey Farm'
          }],
          subtotal: 12.0,
          shipping_method: {
            id: 'standard', name: 'Standard Delivery',
            description: 'Delivery in 3-5 business days',
            price: 5.0, estimated_days: 4
          },
          shipping_cost: 5.0,
          payment_method: {
            id: 'cod', type: 'cash_on_delivery', name: 'Cash on Delivery'
          },
          payment_fees: 0.0,
          tax_amount: 1.70,
          total_amount: 18.70
        },
        session_id: 'test_session_123',
        terms_accepted: true,
        marketing_consent: false
      };

      const mockOrder: Order = {
        id: 123,
        user_id: 1,
        subtotal: 12.0,
        shipping_cost: 5.0,
        total: 18.70,
        status: 'pending',
        payment_method: 'cash_on_delivery',
        shipping_method: 'HOME',
        shipping_address: 'Πανεπιστημίου 15, Αθήνα 10679',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: []
      };

      mockApiClient.checkout.mockResolvedValue(mockOrder);

      const result = await client.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(result.errors).toHaveLength(0);
      expect(result.validationProof).toContain('Order 123 created');
    });

    it('should reject checkout with validation errors', async () => {
      const invalidCheckoutData = {
        customer: {
          firstName: '', // Required field
          lastName: 'Π', // Too short
          email: 'invalid-email', // Invalid format
          phone: '123' // Too short
        },
        shipping: {
          address: '123', // Too short
          city: 'City123', // Invalid characters
          postalCode: '123', // Invalid format
        },
        order: {
          items: [], // Empty cart
          subtotal: -5, // Negative amount
        },
        session_id: '',
        terms_accepted: false // Must be true
      };

      const result = await client.processValidatedCheckout(invalidCheckoutData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.validationProof).toContain('Form invalid');
    });

    it('should reject checkout with postal code/city mismatch', async () => {
      const { validatePostalCodeCity } = await import('../../src/lib/checkout/checkoutValidation');
      vi.mocked(validatePostalCodeCity).mockReturnValue(false);

      const checkoutWithMismatch = {
        customer: {
          firstName: 'Maria', lastName: 'Antoniou',
          email: 'maria@example.com', phone: '2101234567'
        },
        shipping: {
          address: 'Central Street 10', city: 'Athens',
          postalCode: '54621' // Thessaloniki postal code with Athens city
        },
        order: {
          items: [{
            id: 1, product_id: 1, name: 'Test Product', price: 10.0,
            quantity: 1, subtotal: 10.0, producer_name: 'Test Producer'
          }],
          subtotal: 10.0,
          shipping_method: {
            id: 'standard', name: 'Standard', price: 5.0, estimated_days: 3
          },
          shipping_cost: 5.0,
          payment_method: { id: 'cod', type: 'cash_on_delivery', name: 'COD' },
          payment_fees: 0.0, tax_amount: 1.50, total_amount: 16.50
        },
        session_id: 'test_session', terms_accepted: true
      };

      const result = await client.processValidatedCheckout(checkoutWithMismatch);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'city',
        message: 'Η πόλη δεν αντιστοιχεί στον ΤΚ',
        code: 'MISMATCH'
      });
      expect(result.validationProof).toContain('Business validation failed');
    });

    it('should handle API checkout errors', async () => {
      const { validatePostalCodeCity } = await import('../../src/lib/checkout/checkoutValidation');
      vi.mocked(validatePostalCodeCity).mockReturnValue(true);

      mockApiClient.checkout.mockRejectedValue(new Error('HTTP 422: Invalid payment method'));

      const validCheckoutData = {
        customer: { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '2101234567' },
        shipping: { address: 'Test Address 1', city: 'Athens', postalCode: '10681' },
        order: {
          items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'Test' }],
          subtotal: 10, shipping_cost: 5, tax_amount: 1.5, total_amount: 16.5,
          shipping_method: { id: 'standard', name: 'Standard', price: 5, estimated_days: 3 },
          payment_method: { id: 'invalid', type: 'card', name: 'Invalid' },
          payment_fees: 0
        },
        session_id: 'test', terms_accepted: true
      };

      const result = await client.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('Μη έγκυρα δεδομένα');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });
  });

  describe('Error handling', () => {
    it('should classify HTTP errors correctly', async () => {
      const testCases = [
        { error: new Error('HTTP 401: Unauthorized'), expectedMessage: 'Μη εξουσιοδοτημένος', retryable: false },
        { error: new Error('HTTP 422: Validation failed'), expectedMessage: 'Μη έγκυρα δεδομένα', retryable: false },
        { error: new Error('HTTP 500: Server error'), expectedMessage: 'Προσωρινό πρόβλημα', retryable: true },
        { error: new Error('Network error'), expectedMessage: 'Πρόβλημα σύνδεσης', retryable: true },
        { error: new Error('Unknown error'), expectedMessage: 'Προσωρινό πρόβλημα', retryable: true }
      ];

      for (const testCase of testCases) {
        mockApiClient.getCart.mockRejectedValue(testCase.error);
        
        const result = await client.getValidatedCart();
        
        expect(result.success).toBe(false);
        expect(result.errors[0].message).toContain(testCase.expectedMessage.split(' ')[0]); // Check first word
        expect(result.errors[0].code).toBe(testCase.retryable ? 'RETRYABLE_ERROR' : 'PERMANENT_ERROR');
      }
    });

    it('should provide detailed validation proofs', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 404: Not found'));

      const result = await client.getValidatedCart();

      expect(result.validationProof).toContain('getValidatedCart: 404');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('🚨 API Error in getValidatedCart:'),
        expect.any(Error)
      );
    });
  });

  describe('checkoutApi singleton', () => {
    it('should export a working singleton instance', () => {
      expect(checkoutApi).toBeInstanceOf(CheckoutApiClient);
      expect(typeof checkoutApi.getValidatedCart).toBe('function');
      expect(typeof checkoutApi.validateOrderSummary).toBe('function');
      expect(typeof checkoutApi.processValidatedCheckout).toBe('function');
      expect(typeof checkoutApi.getShippingQuote).toBe('function');
    });
  });
});