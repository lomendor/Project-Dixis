/**
 * Lean API mocks for E2E cart testing using Playwright route stubs  
 * Comprehensive cart stubs (≤40 LOC)
 */

export const setupCartApiMocks = async (page: any) => {
  const routes = {
    // Cart endpoints
    '**/api/v1/cart/items': { 
      cart_items: [{ 
        id: 1, 
        product: { id: 1, name: 'Κρητικό Ελαιόλαδο', price: '15.50' }, 
        quantity: 2, 
        subtotal: '31.00', 
        producer_name: 'Μανωλάς Farms' 
      }], 
      total_items: 2, 
      total_amount: '31.00' 
    },
    '**/api/v1/cart/add': { success: true, message: 'Added to cart' },
    '**/api/v1/cart/update/*': { success: true, message: 'Cart updated' },
    '**/api/v1/cart/remove/*': { success: true, message: 'Item removed' },
    
    // Auth endpoints
    '**/api/v1/auth/me': { id: 1, name: 'Test Consumer', email: 'test@dixis.local', role: 'consumer' },
    
    // Checkout endpoints
    '**/api/v1/checkout/shipping-quote': { 
      methods: [{ id: 1, name: 'Standard', price: '5.00', description: 'Τυπική παράδοση' }] 
    },
    '**/api/v1/orders': { id: 1001, status: 'confirmed', total: '36.00' }
  };

  for (const [pattern, response] of Object.entries(routes)) {
    await page.route(pattern, async (route: any) => {
      await route.fulfill({
        status: response.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
};

// Alias for compatibility with smoke tests
export const registerSmokeStubs = setupCartApiMocks;