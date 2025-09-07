/**
 * Cart API Mock Handlers
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Provides deterministic cart data for testing
 * Greek product names and producer details for localization testing
 */

import { http, HttpResponse } from 'msw';

// Greek product data for testing
const mockCartItems = [
  {
    id: 1,
    product: {
      id: 123,
      name: 'Ελαιόλαδο Καλαμάτας',
      price: '15.50',
      producer: {
        name: 'Φάρμα Κρήτης',
      },
    },
    quantity: 2,
    subtotal: '31.00',
  },
  {
    id: 2,
    product: {
      id: 456,
      name: 'Μέλι Θυμαρίσιο',
      price: '12.00',
      producer: {
        name: 'Μελισσοκόμος Αθήνας',
      },
    },
    quantity: 1,
    subtotal: '12.00',
  },
];

const emptyCart = {
  cart_items: [],
};

const cartWithItems = {
  cart_items: mockCartItems,
};

export const cartHandlers = [
  // GET /api/cart - Get cart contents
  http.get('/api/cart', () => {
    // Return cart with items for testing, or empty cart for edge case testing
    const shouldReturnEmpty = Math.random() < 0.1; // 10% chance of empty cart
    return HttpResponse.json(shouldReturnEmpty ? emptyCart : cartWithItems);
  }),

  // PUT /api/cart/items/:id - Update item quantity
  http.put('/api/cart/items/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body as { quantity: number };

    // Simulate success response
    return HttpResponse.json({
      message: 'Cart item updated successfully',
      item_id: parseInt(id as string),
      new_quantity: quantity,
    });
  }),

  // DELETE /api/cart/items/:id - Remove item from cart
  http.delete('/api/cart/items/:id', ({ params }) => {
    const { id } = params;

    // Simulate success response
    return HttpResponse.json({
      message: 'Item removed from cart',
      item_id: parseInt(id as string),
    });
  }),

  // POST /api/cart/clear - Clear entire cart
  http.post('/api/cart/clear', () => {
    return HttpResponse.json({
      message: 'Cart cleared successfully',
    });
  }),
];