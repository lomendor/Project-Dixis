/**
 * Lean API mocks for E2E cart testing using Playwright route stubs
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
    
    // Auth endpoints
    '**/api/v1/auth/me': { error: 'Unauthenticated', status: 401 },
    
    // Products API for homepage
    '**/api/v1/public/products': {
      data: [
        { 
          id: 1, 
          name: 'Demo Product', 
          description: 'Fresh Products from Local Producers',
          price: '15.50',
          image: '/images/demo.jpg',
          producer: { name: 'Local Producer' },
          category: { name: 'Oils' }
        }
      ],
      total: 1
    },
    
    // Categories for navigation
    '**/api/v1/categories': {
      data: [{ id: 1, name: 'Oils', slug: 'oils' }],
      total: 1
    }
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