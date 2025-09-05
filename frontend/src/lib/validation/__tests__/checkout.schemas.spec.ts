/**
 * Unit Tests: Core Checkout Validation Schemas
 * Basic validation tests for the 5 core Zod schemas
 */

import { describe, it, expect } from 'vitest';
import { CartLineSchema, PaymentMethodSchema, validateCartLine, formatEuroPrice } from '../checkout';

describe('Core Checkout Schemas', () => {
  describe('CartLineSchema', () => {
    it('validates correct cart line', () => {
      const validData = {
        id: 1, product_id: 123, name: 'Ελαιόλαδο', price: 12.50,
        quantity: 2, subtotal: 25.00, producer_name: 'Παραγωγός',
      };
      
      const result = validateCartLine(validData);
      expect(result.name).toBe('Ελαιόλαδο');
    });

    it('rejects negative price', () => {
      expect(() => {
        CartLineSchema.parse({ id: 1, product_id: 123, name: 'Test', price: -5,
          quantity: 1, subtotal: -5, producer_name: 'Test' });
      }).toThrow('Η τιμή πρέπει να είναι μεγαλύτερη από 0');
    });
  });

  describe('PaymentMethodSchema', () => {
    it('validates Greek payment types', () => {
      const cardMethod = { id: 'card', type: 'card' as const, name: 'Κάρτα' };
      expect(PaymentMethodSchema.parse(cardMethod)).toEqual(cardMethod);
    });
  });

  describe('Utility Functions', () => {
    it('formats Euro prices correctly', () => {
      expect(formatEuroPrice(25.50)).toMatch(/25,50.*€/);
    });
  });
});