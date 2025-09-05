/**
 * Comprehensive Unit Tests for Checkout API Client
 * Testing validation hooks, error handling, and API integration
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { CheckoutApiClient, checkoutApi, useCheckoutValidation } from '../checkout';
import { apiClient } from '../../api';
import type { CartItem, Order } from '../../api';

// Mock the main API client
vi.mock('../../api', () => ({
  apiClient: {
    getCart: vi.fn(),
    checkout: vi.fn(),
  },
}));

// Mock the postal code validation
vi.mock('../../checkout/checkoutValidation', () => ({
  validatePostalCodeCity: vi.fn((postalCode: string, city: string) => {
    // Mock implementation for Athens postal codes
    return postalCode.startsWith('10') && city.toLowerCase().includes('αθήν');
  }),
  getErrorMessage: vi.fn(() => 'Mock error message'),
}));

describe('CheckoutApiClient', () => {
  let client: CheckoutApiClient;
  const mockApiClient = apiClient as {
    getCart: MockedFunction<typeof apiClient.getCart>;
    checkout: MockedFunction<typeof apiClient.checkout>;
  };

  beforeEach(() => {
    client = new CheckoutApiClient();
    vi.clearAllMocks();
  });

  describe('getValidatedCart', () => {
    it('should return validated cart items', async () => {
      const mockCartResponse = {
        items: [
          {
            id: 1,
            quantity: 2,
            subtotal: '25.00',
            product: {
              id: 123,
              name: 'Βιολογικό ελαιόλαδο',
              price: '12.50',
              producer: {
                id: 1,
                name: 'Παραδοσιακή Παραγωγή',
              },
            },
          } as CartItem,
        ],
        total_items: 2,
        total_amount: '25.00',
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await client.getValidatedCart();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 0, // Index-based ID
        product_id: 123,
        name: 'Βιολογικό ελαιόλαδο',
        price: 12.50,
        quantity: 2,
        subtotal: 25.00,
        producer_name: 'Παραδοσιακή Παραγωγή',
      });
    });

    it('should handle invalid cart items', async () => {
      const mockCartResponse = {
        items: [
          {
            id: 1,
            quantity: 0, // Invalid quantity
            subtotal: '25.00',
            product: {
              id: 123,
              name: '',
              price: '12.50',
              producer: {
                id: 1,
                name: 'Παραδοσιακή Παραγωγή',
              },
            },
          } as CartItem,
        ],
        total_items: 0,
        total_amount: '25.00',
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('ποσότητα');
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('Network error'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
      expect(result.errors[0].message).toContain('διαδίκτυο');
    });
  });

  describe('getValidatedShippingMethods', () => {
    it('should return all shipping methods when no postal code provided', async () => {
      const result = await client.getValidatedShippingMethods();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3); // home_delivery, pickup_point, express
      
      const homeDelivery = result.data!.find(m => m.id === 'home_delivery');
      expect(homeDelivery).toBeDefined();
      expect(homeDelivery!.name).toBe('Παράδοση στο σπίτι');
      expect(homeDelivery!.price).toBe(3.50);
    });

    it('should filter shipping methods by postal code', async () => {
      // Test Athens postal code (10xxx)
      const result = await client.getValidatedShippingMethods('10431');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3); // All methods available for Athens
      
      // Test non-Athens postal code that only has some methods
      const limitedResult = await client.getValidatedShippingMethods('73100'); // Chania
      expect(limitedResult.data).toHaveLength(0); // No methods available for this code in mock data
    });

    it('should validate shipping method data structure', async () => {
      const result = await client.getValidatedShippingMethods();

      expect(result.success).toBe(true);
      result.data!.forEach(method => {
        expect(method).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          estimated_days: expect.any(Number),
        });
      });
    });
  });

  describe('getValidatedPaymentMethods', () => {
    it('should return all available payment methods', async () => {
      const result = await client.getValidatedPaymentMethods();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3); // card, bank_transfer, cash_on_delivery
      
      const cardMethod = result.data!.find(m => m.id === 'card');
      expect(cardMethod).toBeDefined();
      expect(cardMethod!.type).toBe('card');
      expect(cardMethod!.name).toBe('Πιστωτική/Χρεωστική Κάρτα');
    });

    it('should validate payment method data structure', async () => {
      const result = await client.getValidatedPaymentMethods();

      expect(result.success).toBe(true);
      result.data!.forEach(method => {
        expect(method).toMatchObject({
          id: expect.any(String),
          type: expect.oneOf(['card', 'bank_transfer', 'cash_on_delivery', 'digital_wallet']),
          name: expect.any(String),
        });
      });
    });
  });

  describe('validateOrderSummary', () => {
    const validOrderData = {
      items: [{
        id: 1,
        product_id: 123,
        name: 'Test Product',
        price: 10.00,
        quantity: 2,
        subtotal: 20.00,
        producer_name: 'Test Producer',
      }],
      subtotal: 20.00,
      shipping_method: {
        id: 'home_delivery',
        name: 'Παράδοση στο σπίτι',
        price: 3.50,
        estimated_days: 3,
      },
      shipping_cost: 3.50,
      payment_method: {
        id: 'card',
        type: 'card' as const,
        name: 'Κάρτα',
      },
      payment_fees: 0.00,
      tax_amount: 2.40,
      total_amount: 25.90, // 20.00 + 3.50 + 0.00 + 2.40
    };

    it('should validate correct order summary', () => {
      const result = client.validateOrderSummary(validOrderData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validOrderData);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid order structure', () => {
      const invalidOrder = {
        ...validOrderData,
        items: [], // Empty cart
      };

      const result = client.validateOrderSummary(invalidOrder);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('κενό');
    });

    it('should detect calculation errors', () => {
      const invalidOrder = {
        ...validOrderData,
        subtotal: 15.00, // Should be 20.00 based on items
      };

      const result = client.validateOrderSummary(invalidOrder);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('υποσύνολο'))).toBe(true);
    });
  });

  describe('processValidatedCheckout', () => {
    const validCheckoutData = {
      customer: {
        firstName: 'Γιάννης',
        lastName: 'Παπαδόπουλος',
        email: 'giannis@example.com',
        phone: '+30 210 1234567',
      },
      shipping: {
        address: 'Λεωφόρος Αθηνών 123',
        city: 'Αθήνα',
        postalCode: '10431',
      },
      order: {
        items: [{
          id: 1,
          product_id: 123,
          name: 'Test Product',
          price: 10.00,
          quantity: 1,
          subtotal: 10.00,
          producer_name: 'Test Producer',
        }],
        subtotal: 10.00,
        shipping_method: {
          id: 'home_delivery',
          name: 'Παράδοση στο σπίτι',
          price: 3.50,
          estimated_days: 3,
        },
        shipping_cost: 3.50,
        payment_method: {
          id: 'card',
          type: 'card' as const,
          name: 'Κάρτα',
        },
        payment_fees: 0.00,
        tax_amount: 1.35,
        total_amount: 14.85, // 10.00 + 3.50 + 0.00 + 1.35
      },
      session_id: 'sess_12345',
      terms_accepted: true,
      marketing_consent: false,
    };

    const mockOrder: Order = {
      id: 456,
      user_id: 1,
      subtotal: '10.00',
      tax_amount: '1.35',
      shipping_amount: '3.50',
      total_amount: '14.85',
      payment_status: 'pending',
      payment_method: 'card',
      status: 'pending',
      shipping_method: 'home_delivery',
      created_at: '2024-01-01T10:00:00Z',
      items: [],
      order_items: [],
    };

    it('should process valid checkout successfully', async () => {
      mockApiClient.checkout.mockResolvedValue(mockOrder);

      const result = await client.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
      expect(mockApiClient.checkout).toHaveBeenCalledWith({
        payment_method: 'card',
        shipping_method: 'home_delivery',
        shipping_address: 'Λεωφόρος Αθηνών 123',
        shipping_cost: 3.50,
        shipping_carrier: 'Παράδοση στο σπίτι',
        shipping_eta_days: 3,
        postal_code: '10431',
        city: 'Αθήνα',
        notes: undefined,
      });
    });

    it('should reject invalid form data', async () => {
      const invalidData = {
        ...validCheckoutData,
        customer: {
          ...validCheckoutData.customer,
          email: 'invalid-email',
        },
      };

      const result = await client.processValidatedCheckout(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('email'))).toBe(true);
      expect(mockApiClient.checkout).not.toHaveBeenCalled();
    });

    it('should validate postal code and city combination', async () => {
      const invalidLocationData = {
        ...validCheckoutData,
        shipping: {
          ...validCheckoutData.shipping,
          city: 'Θεσσαλονίκη', // Doesn't match Athens postal code
          postalCode: '10431',
        },
      };

      const result = await client.processValidatedCheckout(invalidLocationData);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'shipping.city')).toBe(true);
      expect(mockApiClient.checkout).not.toHaveBeenCalled();
    });

    it('should handle API checkout errors', async () => {
      mockApiClient.checkout.mockRejectedValue(new Error('HTTP 422: Validation failed'));

      const result = await client.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
      expect(result.errors[0].message).toContain('έγκυρα');
    });
  });

  describe('validateCheckoutFormField', () => {
    it('should validate individual field correctly', () => {
      const result = client.validateCheckoutFormField('customer.email', 'test@example.com');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid field value', () => {
      const result = client.validateCheckoutFormField('customer.email', 'invalid-email');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should handle nested field paths', () => {
      const result = client.validateCheckoutFormField('shipping.postalCode', '12345');

      expect(result.isValid).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const result = client.validateCheckoutFormField('invalid.path', null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should map HTTP status codes to Greek messages', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 401: Unauthorized'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('εξουσιοδότηση');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });

    it('should handle network errors', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('Network request failed'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('διαδίκτυο');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });

    it('should handle server errors as retryable', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 500: Internal Server Error'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('διακομιστή');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });

    it('should handle rate limiting errors', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 429: Too Many Requests'));

      const result = await client.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('αιτήσεις');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });
});

describe('Singleton Instance and Hooks', () => {
  it('should provide singleton checkout API instance', () => {
    expect(checkoutApi).toBeInstanceOf(CheckoutApiClient);
  });

  it('should provide validation hook with correct methods', () => {
    const hook = useCheckoutValidation();

    expect(hook).toHaveProperty('validateField');
    expect(hook).toHaveProperty('validateOrderSummary');
    expect(hook).toHaveProperty('processCheckout');
    expect(hook).toHaveProperty('getCart');
    expect(hook).toHaveProperty('getShippingMethods');
    expect(hook).toHaveProperty('getPaymentMethods');

    expect(typeof hook.validateField).toBe('function');
    expect(typeof hook.processCheckout).toBe('function');
  });
});

describe('Greek Market Specific Features', () => {
  it('should provide Greek payment methods', async () => {
    const result = await checkoutApi.getValidatedPaymentMethods();

    expect(result.success).toBe(true);
    
    const methods = result.data!;
    expect(methods.some(m => m.id === 'cash_on_delivery')).toBe(true); // Popular in Greece
    expect(methods.some(m => m.id === 'bank_transfer')).toBe(true); // Common in Greece
    
    const codMethod = methods.find(m => m.id === 'cash_on_delivery');
    expect(codMethod!.name).toBe('Αντικαταβολή');
  });

  it('should provide Greek shipping options', async () => {
    const result = await checkoutApi.getValidatedShippingMethods();

    expect(result.success).toBe(true);
    
    const methods = result.data!;
    const homeDelivery = methods.find(m => m.id === 'home_delivery');
    expect(homeDelivery!.name).toBe('Παράδοση στο σπίτι');
    expect(homeDelivery!.description).toContain('εργάσιμων ημερών');
  });

  it('should handle Greek postal code filtering', async () => {
    // Test Athens area codes
    const athensResult = await checkoutApi.getValidatedShippingMethods('10431');
    expect(athensResult.success).toBe(true);
    expect(athensResult.data!.length).toBeGreaterThan(0);
    
    // Test remote area that might have limited options
    const remoteResult = await checkoutApi.getValidatedShippingMethods('84700'); // Cyclades
    expect(remoteResult.success).toBe(true);
    // Remote areas might have fewer options, but that's expected
  });
});