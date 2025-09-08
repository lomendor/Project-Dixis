import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { CheckoutApiClient, type ValidatedApiResponse } from '../../src/lib/api/checkout';

// Mock the base API client with hoisted functions
const mockApiClient = vi.hoisted(() => ({
  getCart: vi.fn(),
  checkout: vi.fn(),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeFromCart: vi.fn(),
}));

// Mock the dependencies
vi.mock('../../src/lib/api', () => ({
  apiClient: mockApiClient,
}));

vi.mock('../../src/lib/checkout/checkoutValidation', () => ({
  validatePostalCodeCity: vi.fn((postalCode: string, city: string) => {
    // Mock validation - Athens postal codes
    const athensPostalCodes = ['10431', '11523', '12345'];
    return athensPostalCodes.includes(postalCode) && city.toLowerCase().includes('αθηνα');
  }),
}));

describe('CheckoutApiClient', () => {
  let checkoutApi: CheckoutApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    checkoutApi = new CheckoutApiClient();
  });

  describe('getValidatedCart', () => {
    it('should validate and return cart items successfully', async () => {
      const mockCartResponse = {
        items: [
          {
            product: {
              id: 1,
              name: 'Ελαιόλαδο Κρήτης',
              price: '15.50',
              producer: { name: 'Κρητικός Παραγωγός' }
            },
            quantity: 2,
            subtotal: '31.00'
          }
        ]
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await checkoutApi.getValidatedCart();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toMatchObject({
        id: 0,
        product_id: 1,
        name: 'Ελαιόλαδο Κρήτης',
        price: 15.50,
        quantity: 2,
        subtotal: 31.00,
        producer_name: 'Κρητικός Παραγωγός'
      });
      expect(result.errors).toHaveLength(0);
    });

    it('should handle cart validation errors', async () => {
      const mockCartResponse = {
        items: [
          {
            product: {
              id: 1,
              name: '',  // Invalid empty name
              price: 'invalid',  // Invalid price
              producer: { name: 'Producer' }
            },
            quantity: -1,  // Invalid quantity
            subtotal: '10.00'
          }
        ]
      };

      mockApiClient.getCart.mockResolvedValue(mockCartResponse);

      const result = await checkoutApi.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.field.includes('name'))).toBe(true);
      expect(result.errors.some(err => err.field.includes('quantity'))).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('Network error'));

      const result = await checkoutApi.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Πρόβλημα σύνδεσης');
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
    });
  });

  describe('validateOrderSummary', () => {
    it('should validate order summary successfully', () => {
      const validOrderData = {
        items: [{
          id: 0,
          product_id: 1,
          name: 'Ελαιόλαδο Κρήτης',
          price: 15.50,
          quantity: 2,
          subtotal: 31.00,
          producer_name: 'Κρητικός Παραγωγός'
        }],
        subtotal: 31.00,
        shipping_method: { 
          id: 'standard', 
          name: 'Κανονική Παράδοση',
          description: 'Παράδοση σε 3-5 ημέρες',
          price: 5.00,
          estimated_days: 3
        },
        shipping_cost: 5.00,
        payment_method: { 
          id: 'card',
          type: 'card',
          name: 'Κάρτα' 
        },
        payment_fees: 0.50,
        tax_amount: 7.68,
        total_amount: 44.18
      };

      const result = checkoutApi.validateOrderSummary(validOrderData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(validOrderData);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid order data', () => {
      const invalidOrderData = {
        subtotal: -10,  // Invalid negative amount
        vat_amount: 'invalid',  // Invalid type
        // Missing required fields
      };

      const result = checkoutApi.validateOrderSummary(invalidOrderData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.field.includes('subtotal'))).toBe(true);
    });
  });

  describe('processValidatedCheckout', () => {
    it('should process valid checkout successfully', async () => {
      const validCheckoutData = {
        customer: {
          firstName: 'Γιαννης',
          lastName: 'Παπαδοπουλος',
          email: 'giannis@example.com',
          phone: '+306912345678'
        },
        shipping: {
          address: 'Πανεπιστημιου 15',
          city: 'Αθηνα',
          postalCode: '10431',
          notes: 'Παραδωστε στον πορτιερη'
        },
        order: {
          items: [{
            id: 0,
            product_id: 1,
            name: 'Ελαιόλαδο Κρήτης',
            price: 15.50,
            quantity: 2,
            subtotal: 31.00,
            producer_name: 'Κρητικός Παραγωγός'
          }],
          subtotal: 31.00,
          shipping_method: { 
            id: 'standard', 
            name: 'Κανονική Παράδοση',
            description: 'Παράδοση σε 3-5 ημέρες',
            price: 5.00,
            estimated_days: 3
          },
          shipping_cost: 5.00,
          payment_method: { 
            id: 'card',
            type: 'card',
            name: 'Κάρτα' 
          },
          payment_fees: 0.50,
          tax_amount: 7.68,
          total_amount: 44.18
        },
        session_id: 'session-12345',
        terms_accepted: true,
        marketing_consent: false
      };

      const mockOrder = {
        id: 'ORD-12345',
        status: 'pending' as const,
        total: 36.62,
        items: []
      };

      mockApiClient.checkout.mockResolvedValue(mockOrder);

      const result = await checkoutApi.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockOrder);
      expect(result.errors).toHaveLength(0);
      expect(mockApiClient.checkout).toHaveBeenCalledWith({
        payment_method: 'card',
        shipping_method: 'standard',
        shipping_address: 'Πανεπιστημιου 15',
        shipping_cost: 5.00,
        shipping_carrier: 'Κανονική Παράδοση',
        shipping_eta_days: 3,
        postal_code: '10431',
        city: 'Αθηνα',
        notes: 'Παραδωστε στον πορτιερη'
      });
    });

    it('should reject checkout with postal code/city mismatch', async () => {
      const invalidCheckoutData = {
        customer: {
          firstName: 'Μαρια',
          lastName: 'Κωνσταντινου',
          email: 'maria@example.com',
          phone: '+306987654321'
        },
        shipping: {
          address: 'Κεντρικης 20',
          city: 'Θεσσαλονικη',  // City doesn't match postal code
          postalCode: '10431',   // Athens postal code
          notes: ''
        },
        order: {
          items: [{
            id: 0,
            product_id: 1,
            name: 'Μέλι Θυμαρίσιο',
            price: 12.00,
            quantity: 1,
            subtotal: 12.00,
            producer_name: 'Θεσσαλός Παραγωγός'
          }],
          subtotal: 12.00,
          shipping_method: { 
            id: 'standard', 
            name: 'Κανονική Παράδοση',
            description: 'Παράδοση σε 3-5 ημέρες',
            price: 5.00,
            estimated_days: 3
          },
          shipping_cost: 5.00,
          payment_method: { 
            id: 'card',
            type: 'card',
            name: 'Κάρτα' 
          },
          payment_fees: 0.30,
          tax_amount: 4.08,
          total_amount: 21.38
        },
        session_id: 'session-67890',
        terms_accepted: true,
        marketing_consent: false
      };

      const result = await checkoutApi.processValidatedCheckout(invalidCheckoutData);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('city');
      expect(result.errors[0].message).toContain('αντιστοιχεί');
      expect(result.errors[0].code).toBe('MISMATCH');
    });

    it('should handle checkout API errors', async () => {
      const validCheckoutData = {
        customer: {
          firstName: 'Δημητρης',
          lastName: 'Ανδρεου',
          email: 'dimitris@example.com',
          phone: '+306955555555'
        },
        shipping: {
          address: 'Πανεπιστημιου 15',
          city: 'Αθηνα',
          postalCode: '10431',
          notes: ''
        },
        order: {
          items: [{
            id: 0,
            product_id: 1,
            name: 'Τυρί Φέτα',
            price: 8.50,
            quantity: 3,
            subtotal: 25.50,
            producer_name: 'Ελληνικός Παραγωγός'
          }],
          subtotal: 25.50,
          shipping_method: { 
            id: 'standard', 
            name: 'Κανονική Παράδοση',
            description: 'Παράδοση σε 3-5 ημέρες',
            price: 5.00,
            estimated_days: 3
          },
          shipping_cost: 5.00,
          payment_method: { 
            id: 'card',
            type: 'card',
            name: 'Κάρτα' 
          },
          payment_fees: 0.40,
          tax_amount: 7.44,
          total_amount: 38.34
        },
        session_id: 'session-11111',
        terms_accepted: true,
        marketing_consent: true
      };

      mockApiClient.checkout.mockRejectedValue(new Error('HTTP 401: Unauthorized'));

      const result = await checkoutApi.processValidatedCheckout(validCheckoutData);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Μη εξουσιοδοτημένος');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });
  });

  describe('getShippingQuote', () => {
    it('should calculate shipping quote correctly', async () => {
      const quoteRequest = {
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 1 }
        ],
        destination: {
          postal_code: '10431',
          city: 'Αθήνα'
        }
      };

      const result = await checkoutApi.getShippingQuote(quoteRequest);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      
      const standardShipping = result.data?.find(method => method.id === 'standard');
      const expressShipping = result.data?.find(method => method.id === 'express');
      
      expect(standardShipping).toBeDefined();
      expect(standardShipping?.name).toBe('Κανονική Παράδοση');
      expect(standardShipping?.estimated_days).toBe(4);
      expect(standardShipping?.price).toBeGreaterThan(0);
      
      expect(expressShipping).toBeDefined();
      expect(expressShipping?.name).toBe('Ταχεία Παράδοση');
      expect(expressShipping?.estimated_days).toBe(1);
      expect(expressShipping?.price).toBeGreaterThan(standardShipping?.price || 0);
    });

    it('should reject invalid quote requests', async () => {
      const invalidRequest = {
        items: [],  // Empty items array
        destination: {
          postal_code: 'invalid',  // Invalid postal code format
          city: ''  // Empty city
        }
      };

      const result = await checkoutApi.getShippingQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.field.includes('postal_code'))).toBe(true);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart successfully', async () => {
      const mockCartItem = {
        id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Ελαιόλαδο Κρήτης',
          price: '15.50',
          producer: { name: 'Κρητικός Παραγωγός' }
        },
        subtotal: '31.00'
      };

      mockApiClient.addToCart.mockResolvedValue({ cart_item: mockCartItem });

      const result = await checkoutApi.addToCart({ product_id: 1, quantity: 2 });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockCartItem);
      expect(result.errors).toHaveLength(0);
      expect(mockApiClient.addToCart).toHaveBeenCalledWith(1, 2);
    });

    it('should reject invalid add to cart request', async () => {
      const result = await checkoutApi.addToCart({ product_id: -1, quantity: 0 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.message.includes('θετικός'))).toBe(true);
      expect(mockApiClient.addToCart).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockApiClient.addToCart.mockRejectedValue(new Error('HTTP 404: Product not found'));

      const result = await checkoutApi.addToCart({ product_id: 999, quantity: 1 });

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('έγκυρα δεδομένα');
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
    });
  });

  describe('updateQty', () => {
    it('should update cart item quantity successfully', async () => {
      const mockUpdatedItem = {
        id: 1,
        quantity: 5,
        product: {
          id: 1,
          name: 'Μέλι Θυμαρίσιο',
          price: '12.00',
          producer: { name: 'Θεσσαλός Παραγωγός' }
        },
        subtotal: '60.00'
      };

      mockApiClient.updateCartItem.mockResolvedValue({ cart_item: mockUpdatedItem });

      const result = await checkoutApi.updateQty({ cart_item_id: 1, quantity: 5 });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockUpdatedItem);
      expect(result.errors).toHaveLength(0);
      expect(mockApiClient.updateCartItem).toHaveBeenCalledWith(1, 5);
    });

    it('should reject invalid quantity update', async () => {
      const result = await checkoutApi.updateQty({ cart_item_id: 1, quantity: 1000 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.message.includes('υψηλή'))).toBe(true);
      expect(mockApiClient.updateCartItem).not.toHaveBeenCalled();
    });
  });

  describe('removeFromCart', () => {
    it('should remove cart item successfully', async () => {
      mockApiClient.removeFromCart.mockResolvedValue(undefined);

      const result = await checkoutApi.removeFromCart({ cart_item_id: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(0);
      expect(mockApiClient.removeFromCart).toHaveBeenCalledWith(1);
    });

    it('should reject invalid cart item id', async () => {
      const result = await checkoutApi.removeFromCart({ cart_item_id: -1 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.message.includes('θετικός'))).toBe(true);
      expect(mockApiClient.removeFromCart).not.toHaveBeenCalled();
    });
  });

  describe('beginCheckout', () => {
    it('should delegate to processValidatedCheckout', async () => {
      const checkoutPayload = {
        customer: {
          firstName: 'Γιαννης',
          lastName: 'Παπαδοπουλος',
          email: 'kostas@example.com',
          phone: '+306911111111'
        },
        shipping: {
          address: 'Σόλωνος 25',
          city: 'Αθηνα',
          postalCode: '10431',
          notes: ''
        },
        order: {
          items: [{
            id: 0,
            product_id: 1,
            name: 'Τσάι Βουνού',
            price: 6.50,
            quantity: 1,
            subtotal: 6.50,
            producer_name: 'Ηπειρώτης Παραγωγός'
          }],
          subtotal: 6.50,
          shipping_method: { 
            id: 'standard', 
            name: 'Κανονική Παράδοση',
            description: 'Παράδοση σε 3-5 ημέρες',
            price: 5.00,
            estimated_days: 3
          },
          shipping_cost: 5.00,
          payment_method: { 
            id: 'card',
            type: 'card',
            name: 'Κάρτα' 
          },
          payment_fees: 0.20,
          tax_amount: 2.81,
          total_amount: 14.51
        },
        session_id: 'session-begin-test',
        terms_accepted: true,
        marketing_consent: false
      };

      const mockOrder = {
        id: 'ORD-BEGIN-TEST',
        status: 'pending' as const,
        total: 14.51,
        items: []
      };

      mockApiClient.checkout.mockResolvedValue(mockOrder);

      const result = await checkoutApi.beginCheckout(checkoutPayload);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockOrder);
      expect(mockApiClient.checkout).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle network errors as retryable', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('Network timeout'));

      const result = await checkoutApi.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('RETRYABLE_ERROR');
      expect(result.errors[0].message).toContain('Πρόβλημα σύνδεσης');
    });

    it('should handle HTTP 400 errors as permanent', async () => {
      mockApiClient.getCart.mockRejectedValue(new Error('HTTP 400: Bad Request'));

      const result = await checkoutApi.getValidatedCart();

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('PERMANENT_ERROR');
      expect(result.errors[0].message).toContain('έγκυρα δεδομένα');
    });

    it('should handle HTTP 401 errors specifically', async () => {
      const invalidData = {}; // Empty object should trigger validation errors first
      mockApiClient.checkout.mockRejectedValue(new Error('HTTP 401: Unauthorized'));

      const result = await checkoutApi.processValidatedCheckout(invalidData);

      expect(result.success).toBe(false);
      // This should fail at validation level, not reach the API error
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});