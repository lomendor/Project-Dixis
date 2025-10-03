/**
 * Complete Cart Fixtures with Full Zod Schema Compliance
 * These fixtures satisfy CartLineSchema validation requirements
 */

// Valid cart item matching API response structure
export const validCartItem = {
  id: 1,
  product: {
    id: 1,
    name: 'Test Product',
    price: '12.50',  // API returns strings
    producer: { name: 'Test Producer' }
  },
  quantity: 2,
  subtotal: '25.00'  // API returns strings
};

// Valid cart response from API (what MSW returns)
export const validCartResponse = {
  items: [validCartItem],
  total_items: 1,
  total_amount: '25.00'
};

// Invalid cart item for validation error testing
export const invalidCartItem = {
  id: 1,
  product: {
    id: 'invalid',  // Should be number
    name: '',       // Should be non-empty
    price: 'invalid', // Should be numeric string
    producer: { name: '' } // Should be non-empty
  },
  quantity: -1,     // Should be positive
  subtotal: 'invalid' // Should be numeric string
};

// Invalid cart response for validation testing
export const invalidCartResponse = {
  items: [invalidCartItem],
  total_items: 1,
  total_amount: '0.00'
};
