/**
 * API Route Mocks for E2E Tests
 * Isolates smoke tests from backend dependency
 */

import { Page } from '@playwright/test';

export async function setupApiMocks(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    console.log(`🎭 Mock API: ${method} ${url}`);
    
    // Products API
    if (url.includes('/api/v1/public/products')) {
      const mockProducts = [
        {
          id: 1,
          name: 'Ελαιόλαδο Κρήτης',
          price: '15.50',
          description: 'Premium extra virgin olive oil from Crete',
          producer: { 
            id: 1, 
            name: 'Κρητικός Παραγωγός',
            region: 'Heraklion'
          },
          categories: [{ id: 1, name: 'Olive Oil' }],
          image_url: '/images/olive-oil.jpg',
          in_stock: true,
          stock_quantity: 50
        },
        {
          id: 2,
          name: 'Μέλι Θυμαριού',
          price: '12.00',
          description: 'Pure thyme honey from Greek mountains',
          producer: { 
            id: 2, 
            name: 'Μελισσοκόμος Πάρνηθας',
            region: 'Attica'
          },
          categories: [{ id: 2, name: 'Honey' }],
          image_url: '/images/honey.jpg',
          in_stock: true,
          stock_quantity: 30
        }
      ];
      
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ data: mockProducts, total: mockProducts.length })
      });
    }
    
    // Cart API
    if (url.includes('/api/v1/cart')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          items: [],
          total: '0.00',
          subtotal: '0.00',
          tax: '0.00'
        })
      });
    }
    
    // Auth API
    if (url.includes('/api/v1/auth/me') || url.includes('/api/v1/auth/profile')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          id: 1, 
          name: 'Test User',
          email: 'test@dixis.local',
          role: 'consumer',
          verified: true
        })
      });
    }
    
    if (url.includes('/api/v1/auth/login')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          user: { 
            id: 1, 
            name: 'Test User',
            email: 'test@dixis.local',
            role: 'consumer'
          },
          token: 'mock_jwt_token'
        })
      });
    }
    
    // Orders API
    if (url.includes('/api/v1/orders')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
    
    // Categories API
    if (url.includes('/api/v1/categories')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Olive Oil', slug: 'olive-oil' },
          { id: 2, name: 'Honey', slug: 'honey' },
          { id: 3, name: 'Cheese', slug: 'cheese' }
        ])
      });
    }
    
    // Checkout API
    if (url.includes('/api/v1/checkout')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'Checkout completed successfully',
          order_id: '12345',
          total: '15.50'
        })
      });
    }
    
    // Default successful response for any other API calls
    return route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });
}