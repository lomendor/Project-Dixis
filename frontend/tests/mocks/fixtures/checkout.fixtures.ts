/**
 * Complete Checkout Fixtures with Full Zod Schema Compliance
 * These fixtures satisfy CheckoutFormSchema and OrderSummary validation
 */

// Valid checkout form matching CheckoutFormSchema
export const validCheckoutForm = {
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    phone: '2101234567'
  },
  shipping: {
    address: 'Test Street 123',
    city: 'Αθήνα',      // Greek city name
    postalCode: '10671', // Valid Athens postal code
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
      name: 'Standard Shipping',
      description: 'Παράδοση σε 2-3 εργάσιμες ημέρες',
      price: 5.00,
      estimated_days: 3
    },
    payment_method: {
      id: 'card',
      type: 'card' as const,
      name: 'Credit Card'
    }
  },
  session_id: 'test_session_123',
  terms_accepted: true
};

// Valid order response from API
export const validOrderResponse = {
  id: 'order_123',
  total: 36.00,
  status: 'pending' as const,
  created_at: '2024-01-01T10:00:00Z'
};

// Shipping quote request
export const validShippingQuoteRequest = {
  items: [{ product_id: 1, quantity: 2 }],
  destination: {
    postal_code: '10671',  // Athens metro - returns 1 method
    city: 'Αθήνα'
  }
};

// Shipping quote request for 2 methods (non-Athens to trigger multiple methods)
export const shippingQuoteRequestMultipleMethods = {
  items: [{ product_id: 1, quantity: 2 }],
  destination: {
    postal_code: '54622',  // Thessaloniki - should return different zone
    city: 'Θεσσαλονίκη'
  }
};
