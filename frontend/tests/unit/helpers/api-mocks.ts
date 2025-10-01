/**
 * Shared API mocks and test data for checkout tests
 */
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { apiUrl } from '../../../src/lib/api';

export const server = setupServer();

export const mockCartResponse = {
  cart_items: [{  // API uses cart_items, not items
    id: 1,
    product: {
      id: 1,
      name: 'Test Product',
      price: '12.50',  // API returns strings
      producer: { name: 'Test Producer' }
    },
    quantity: 2,
    subtotal: '25.00'  // API returns strings
  }],
  total_items: 1,
  total_amount: '25.00'
};

export const mockOrderResponse = {
  order: {  // API wraps order in {order: ...}
    id: 'order_123',
    total: 25.00,
    status: 'pending' as const,
    created_at: '2024-01-01T10:00:00Z'
  }
};

export const mockCheckoutForm = {
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
      name: 'Standard Shipping',
      description: 'Standard delivery in 2-3 business days',
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

// Helper to create error response handlers
export const createErrorHandler = (endpoint: string, status: number, delay_ms = 0) => 
  http.get(apiUrl(endpoint), async () => {
    if (delay_ms > 0) await delay(delay_ms);
    return new HttpResponse(null, { status });
  });

// Helper for success responses  
export const createSuccessHandler = (endpoint: string, response: any, delay_ms = 0) =>
  http.get(apiUrl(endpoint), async () => {
    if (delay_ms > 0) await delay(delay_ms);
    return HttpResponse.json(response);
  });