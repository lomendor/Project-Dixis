/**
 * Comprehensive Unit Tests for Checkout Validation Schemas
 * Testing all Zod schemas and validation functions with Greek localization
 */

import { describe, it, expect } from 'vitest';
import {
  CartLineSchema,
  ShippingMethodSchema,
  PaymentMethodSchema,
  OrderSummarySchema,
  CheckoutFormSchema,
  validateCartLine,
  validateCheckoutForm,
  safeValidateCartLine,
  calculateCartSubtotal,
  calculateOrderTotal,
  formatEuroPrice,
  validateOrderTotals,
  type CartLine,
  type OrderSummary,
} from '../checkout';

describe('CartLineSchema', () => {
  const validCartLine = {
    id: 1,
    product_id: 123,
    name: 'Βιολογικό ελαιόλαδο',
    price: 12.50,
    quantity: 2,
    subtotal: 25.00,
    producer_name: 'Παραδοσιακή Παραγωγή',
  };

  it('should validate a correct cart line', () => {
    const result = CartLineSchema.parse(validCartLine);
    expect(result).toEqual(validCartLine);
  });

  it('should reject invalid product_id', () => {
    expect(() => {
      CartLineSchema.parse({ ...validCartLine, product_id: 'invalid' });
    }).toThrow('Το ID του προϊόντος πρέπει να είναι ακέραιος αριθμός');
  });

  it('should reject negative price', () => {
    expect(() => {
      CartLineSchema.parse({ ...validCartLine, price: -5.00 });
    }).toThrow('Η τιμή πρέπει να είναι μεγαλύτερη από 0');
  });

  it('should reject zero quantity', () => {
    expect(() => {
      CartLineSchema.parse({ ...validCartLine, quantity: 0 });
    }).toThrow('Η ποσότητα πρέπει να είναι τουλάχιστον 1');
  });

  it('should reject excessive quantity', () => {
    expect(() => {
      CartLineSchema.parse({ ...validCartLine, quantity: 1000 });
    }).toThrow('Η ποσότητα είναι πολύ υψηλή');
  });

  it('should reject empty product name', () => {
    expect(() => {
      CartLineSchema.parse({ ...validCartLine, name: '' });
    }).toThrow('Το όνομα του προϊόντος είναι υποχρεωτικό');
  });
});

describe('ShippingMethodSchema', () => {
  const validShippingMethod = {
    id: 'home_delivery',
    name: 'Παράδοση στο σπίτι',
    description: 'Παράδοση εντός 2-3 εργάσιμων ημερών',
    price: 3.50,
    estimated_days: 3,
    available_for_postal_codes: ['10', '11', '54'],
  };

  it('should validate a correct shipping method', () => {
    const result = ShippingMethodSchema.parse(validShippingMethod);
    expect(result).toEqual(validShippingMethod);
  });

  it('should allow shipping method without postal codes', () => {
    const { available_for_postal_codes: _, ...methodWithoutCodes } = validShippingMethod;
    const result = ShippingMethodSchema.parse(methodWithoutCodes);
    expect(result.available_for_postal_codes).toBeUndefined();
  });

  it('should reject negative price', () => {
    expect(() => {
      ShippingMethodSchema.parse({ ...validShippingMethod, price: -1.00 });
    }).toThrow('Το κόστος παράδοσης δεν μπορεί να είναι αρνητικό');
  });

  it('should reject negative estimated days', () => {
    expect(() => {
      ShippingMethodSchema.parse({ ...validShippingMethod, estimated_days: -1 });
    }).toThrow('Οι εκτιμώμενες ημέρες δεν μπορούν να είναι αρνητικές');
  });

  it('should reject too many estimated days', () => {
    expect(() => {
      ShippingMethodSchema.parse({ ...validShippingMethod, estimated_days: 100 });
    }).toThrow('Οι εκτιμώμενες ημέρες είναι πολλές');
  });
});

describe('PaymentMethodSchema', () => {
  const validPaymentMethod = {
    id: 'card',
    type: 'card' as const,
    name: 'Πιστωτική Κάρτα',
    description: 'Visa, Mastercard',
    fee_percentage: 2.5,
    fixed_fee: 0.30,
    minimum_amount: 5.00,
  };

  it('should validate a correct payment method', () => {
    const result = PaymentMethodSchema.parse(validPaymentMethod);
    expect(result).toEqual(validPaymentMethod);
  });

  it('should validate all payment types', () => {
    const types = ['card', 'bank_transfer', 'cash_on_delivery', 'digital_wallet'];
    
    types.forEach(type => {
      const result = PaymentMethodSchema.parse({
        ...validPaymentMethod,
        type,
      });
      expect(result.type).toBe(type);
    });
  });

  it('should reject invalid payment type', () => {
    expect(() => {
      PaymentMethodSchema.parse({
        ...validPaymentMethod,
        type: 'invalid_type',
      });
    }).toThrow('Μη έγκυρη μέθοδος πληρωμής');
  });

  it('should reject excessive fee percentage', () => {
    expect(() => {
      PaymentMethodSchema.parse({
        ...validPaymentMethod,
        fee_percentage: 15.0,
      });
    }).toThrow('Το ποσοστό χρέωσης είναι πολύ υψηλό');
  });

  it('should allow optional fields to be undefined', () => {
    const minimalPayment = {
      id: 'cash',
      type: 'cash_on_delivery' as const,
      name: 'Αντικαταβολή',
    };
    
    const result = PaymentMethodSchema.parse(minimalPayment);
    expect(result).toEqual(minimalPayment);
  });
});

describe('OrderSummarySchema', () => {
  const validOrderSummary = {
    items: [
      {
        id: 1,
        product_id: 123,
        name: 'Προϊόν 1',
        price: 10.00,
        quantity: 2,
        subtotal: 20.00,
        producer_name: 'Παραγωγός 1',
      },
    ],
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
    payment_fees: 0.50,
    tax_amount: 2.40,
    total_amount: 26.40,
    estimated_delivery_date: '2024-01-15T10:00:00Z',
  };

  it('should validate a correct order summary', () => {
    const result = OrderSummarySchema.parse(validOrderSummary);
    expect(result).toEqual(validOrderSummary);
  });

  it('should reject empty cart', () => {
    expect(() => {
      OrderSummarySchema.parse({
        ...validOrderSummary,
        items: [],
      });
    }).toThrow('Το καλάθι δεν μπορεί να είναι κενό');
  });

  it('should reject cart with too many items', () => {
    const tooManyItems = Array.from({ length: 51 }, (_, i) => ({
      id: i,
      product_id: i,
      name: `Προϊόν ${i}`,
      price: 1.00,
      quantity: 1,
      subtotal: 1.00,
      producer_name: 'Παραγωγός',
    }));

    expect(() => {
      OrderSummarySchema.parse({
        ...validOrderSummary,
        items: tooManyItems,
      });
    }).toThrow('Το καλάθι περιέχει πολλά προϊόντα');
  });

  it('should reject negative totals', () => {
    expect(() => {
      OrderSummarySchema.parse({
        ...validOrderSummary,
        total_amount: -1.00,
      });
    }).toThrow('Το συνολικό ποσό πρέπει να είναι μεγαλύτερο από 0');
  });
});

describe('CheckoutFormSchema', () => {
  const validCheckoutForm = {
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
      notes: 'Παραλαβή μετά τις 18:00',
    },
    order: {
      items: [{
        id: 1,
        product_id: 123,
        name: 'Προϊόν',
        price: 10.00,
        quantity: 1,
        subtotal: 10.00,
        producer_name: 'Παραγωγός',
      }],
      subtotal: 10.00,
      shipping_method: {
        id: 'home',
        name: 'Παράδοση',
        price: 2.00,
        estimated_days: 2,
      },
      shipping_cost: 2.00,
      payment_method: {
        id: 'card',
        type: 'card' as const,
        name: 'Κάρτα',
      },
      payment_fees: 0.00,
      tax_amount: 1.20,
      total_amount: 13.20,
    },
    session_id: 'sess_12345',
    terms_accepted: true,
    marketing_consent: false,
  };

  it('should validate a complete checkout form', () => {
    const result = CheckoutFormSchema.parse(validCheckoutForm);
    expect(result).toEqual(validCheckoutForm);
  });

  it('should reject invalid email', () => {
    expect(() => {
      CheckoutFormSchema.parse({
        ...validCheckoutForm,
        customer: {
          ...validCheckoutForm.customer,
          email: 'invalid-email',
        },
      });
    }).toThrow('Μη έγκυρη διεύθυνση email');
  });

  it('should reject invalid Greek phone number', () => {
    expect(() => {
      CheckoutFormSchema.parse({
        ...validCheckoutForm,
        customer: {
          ...validCheckoutForm.customer,
          phone: '123456',
        },
      });
    }).toThrow('Μη έγκυρος αριθμός τηλεφώνου για Ελλάδα');
  });

  it('should reject invalid postal code format', () => {
    expect(() => {
      CheckoutFormSchema.parse({
        ...validCheckoutForm,
        shipping: {
          ...validCheckoutForm.shipping,
          postalCode: '123', // Too short
        },
      });
    }).toThrow('Ο ταχυδρομικός κώδικας πρέπει να έχει ακριβώς 5 ψηφία');
  });

  it('should reject when terms not accepted', () => {
    expect(() => {
      CheckoutFormSchema.parse({
        ...validCheckoutForm,
        terms_accepted: false,
      });
    }).toThrow('Πρέπει να αποδεχτείτε τους όρους και προϋποθέσεις');
  });

  it('should allow names with Greek characters', () => {
    const greekName = {
      firstName: 'Μαρία-Ελένη',
      lastName: "O'Connor",
      email: 'maria@example.com',
      phone: '+30 210 1234567',
    };

    const result = CheckoutFormSchema.parse({
      ...validCheckoutForm,
      customer: greekName,
    });

    expect(result.customer.firstName).toBe('Μαρία-Ελένη');
    expect(result.customer.lastName).toBe("O'Connor");
  });
});

describe('Utility Functions', () => {
  describe('calculateCartSubtotal', () => {
    it('should calculate correct subtotal for multiple items', () => {
      const items: CartLine[] = [
        {
          id: 1,
          product_id: 1,
          name: 'Item 1',
          price: 10.00,
          quantity: 2,
          subtotal: 20.00,
          producer_name: 'Producer 1',
        },
        {
          id: 2,
          product_id: 2,
          name: 'Item 2',
          price: 5.50,
          quantity: 1,
          subtotal: 5.50,
          producer_name: 'Producer 2',
        },
      ];

      const result = calculateCartSubtotal(items);
      expect(result).toBe(25.50);
    });

    it('should return 0 for empty cart', () => {
      const result = calculateCartSubtotal([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate correct total including all fees', () => {
      const orderSummary: OrderSummary = {
        items: [],
        subtotal: 20.00,
        shipping_method: {
          id: 'test',
          name: 'Test',
          price: 3.50,
          estimated_days: 2,
        },
        shipping_cost: 3.50,
        payment_method: {
          id: 'card',
          type: 'card',
          name: 'Card',
        },
        payment_fees: 0.50,
        tax_amount: 2.40,
        total_amount: 26.40,
      };

      const result = calculateOrderTotal(orderSummary);
      expect(result).toBe(26.40); // 20.00 + 3.50 + 0.50 + 2.40
    });
  });

  describe('formatEuroPrice', () => {
    it('should format price in Greek locale', () => {
      const result = formatEuroPrice(25.50);
      expect(result).toMatch(/25,50.*€/); // Greek format uses comma for decimals
    });

    it('should handle zero price', () => {
      const result = formatEuroPrice(0);
      expect(result).toMatch(/0,00.*€/);
    });
  });

  describe('validateOrderTotals', () => {
    const validOrder: OrderSummary = {
      items: [{
        id: 1,
        product_id: 1,
        name: 'Item',
        price: 10.00,
        quantity: 2,
        subtotal: 20.00,
        producer_name: 'Producer',
      }],
      subtotal: 20.00,
      shipping_method: {
        id: 'test',
        name: 'Test',
        price: 3.50,
        estimated_days: 2,
      },
      shipping_cost: 3.50,
      payment_method: {
        id: 'card',
        type: 'card',
        name: 'Card',
        fee_percentage: 2.0,
        fixed_fee: 0.50,
      },
      payment_fees: 0.97, // (20 + 3.5) * 0.02 + 0.50 = 0.47 + 0.50 = 0.97
      tax_amount: 2.40,
      total_amount: 26.87, // 20.00 + 3.50 + 0.97 + 2.40
    };

    it('should validate correct order totals', () => {
      const result = validateOrderTotals(validOrder);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect incorrect subtotal', () => {
      const incorrectOrder = {
        ...validOrder,
        subtotal: 15.00, // Should be 20.00
      };

      const result = validateOrderTotals(incorrectOrder);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Το υποσύνολο του καλαθιού δεν αντιστοιχεί στα προϊόντα');
    });

    it('should detect incorrect total', () => {
      const incorrectOrder = {
        ...validOrder,
        total_amount: 30.00, // Incorrect total
      };

      const result = validateOrderTotals(incorrectOrder);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Το συνολικό ποσό δεν αντιστοιχεί στα επιμέρους κόστη');
    });

    it('should detect incorrect payment fees', () => {
      const incorrectOrder = {
        ...validOrder,
        payment_fees: 1.50, // Should be 0.97
      };

      const result = validateOrderTotals(incorrectOrder);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Οι χρεώσεις πληρωμής δεν αντιστοιχούν στη μέθοδο πληρωμής');
    });
  });
});

describe('Safe Validation Functions', () => {
  it('should return success for valid data', () => {
    const validData = {
      id: 1,
      product_id: 123,
      name: 'Test Product',
      price: 10.00,
      quantity: 1,
      subtotal: 10.00,
      producer_name: 'Test Producer',
    };

    const result = safeValidateCartLine(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return errors for invalid data', () => {
    const invalidData = {
      id: 'invalid', // Should be number
      product_id: 123,
      name: '',
      price: -5.00,
      quantity: 0,
      subtotal: 10.00,
      producer_name: 'Test Producer',
    };

    const result = safeValidateCartLine(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('Validation Functions (throwing)', () => {
  it('should return parsed data for valid input', () => {
    const validData = {
      id: 1,
      product_id: 123,
      name: 'Test Product',
      price: 10.00,
      quantity: 1,
      subtotal: 10.00,
      producer_name: 'Test Producer',
    };

    const result = validateCartLine(validData);
    expect(result).toEqual(validData);
  });

  it('should throw error for invalid input', () => {
    const invalidData = {
      id: 'invalid',
      product_id: 123,
      name: 'Test Product',
      price: 10.00,
      quantity: 1,
      subtotal: 10.00,
      producer_name: 'Test Producer',
    };

    expect(() => validateCartLine(invalidData)).toThrow();
  });
});

describe('Edge Cases and Greek Localization', () => {
  it('should handle Greek characters in product names', () => {
    const greekProduct = {
      id: 1,
      product_id: 123,
      name: 'Παραδοσιακό ελαιόλαδο από Καλαμάτα',
      price: 15.50,
      quantity: 1,
      subtotal: 15.50,
      producer_name: 'Οικογένεια Παπαδόπουλου',
    };

    const result = validateCartLine(greekProduct);
    expect(result.name).toBe('Παραδοσιακό ελαιόλαδο από Καλαμάτα');
    expect(result.producer_name).toBe('Οικογένεια Παπαδόπουλου');
  });

  it('should handle mixed Greek and Latin characters', () => {
    const mixedData = {
      id: 1,
      product_id: 123,
      name: 'Organic Bio-Oil Βιολογικό',
      price: 25.00,
      quantity: 2,
      subtotal: 50.00,
      producer_name: 'Green Farm Πράσινη Φάρμα',
    };

    const result = validateCartLine(mixedData);
    expect(result).toEqual(mixedData);
  });

  it('should validate Greek postal codes in shipping address', () => {
    const athensAddress = {
      address: 'Πλατεία Συντάγματος 1',
      city: 'Αθήνα',
      postalCode: '10563',
    };

    const validForm = {
      customer: {
        firstName: 'Μαρία',
        lastName: 'Γεωργίου',
        email: 'maria@example.gr',
        phone: '2101234567',
      },
      shipping: athensAddress,
      order: {
        items: [{
          id: 1,
          product_id: 1,
          name: 'Test',
          price: 10,
          quantity: 1,
          subtotal: 10,
          producer_name: 'Test',
        }],
        subtotal: 10,
        shipping_method: { id: 'test', name: 'Test', price: 0, estimated_days: 1 },
        shipping_cost: 0,
        payment_method: { id: 'test', type: 'card' as const, name: 'Test' },
        payment_fees: 0,
        tax_amount: 0,
        total_amount: 10,
      },
      session_id: 'test',
      terms_accepted: true,
    };

    const result = validateCheckoutForm(validForm);
    expect(result.shipping.city).toBe('Αθήνα');
    expect(result.shipping.postalCode).toBe('10563');
  });
});