/**
 * MSW Stubs for E2E Testing
 * Provides deterministic API mocking using Playwright page.route()
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Intercept all API calls (backend routes)
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Authentication endpoints - handle both /auth/me and /auth/profile
    if (url.includes('/auth/me') || url.includes('/auth/profile')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          id: 1, 
          role: 'consumer', 
          email: 'test@dixis.local',
          name: 'Test Consumer',
          created_at: '2023-01-01T00:00:00.000000Z'
        }) 
      });
    }

    // Cart endpoints - return mock cart
    if (url.includes('/cart')) {
      if (method === 'GET') {
        return route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ 
            items: [],
            itemsCount: 0,
            total: 0
          }) 
        });
      }
      return route.fulfill({ status: 200, body: '{}' });
    }

    // Products endpoints - handle both list and individual products
    if (url.includes('/products')) {
      // Individual product (e.g., /products/12)
      if (url.match(/\/products\/\d+$/)) {
        const productId = url.split('/').pop();
        return route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ 
            id: parseInt(productId || '1'), 
            name: `Mock Product ${productId}`, 
            price: 12.90,
            description: 'Test product for E2E',
            category: 'Test Category',
            images: [{
              id: 1,
              url: '/placeholder.jpg',
              image_path: '/placeholder.jpg', 
              alt_text: `Mock Product ${productId} Image`,
              is_primary: true
            }],
            producer_id: 1,
            producer: { id: 1, name: 'Test Producer' }
          }) 
        });
      }
      
      // Products list
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { 
              id: 1, 
              name: 'Mock Product 1', 
              price: 12.90,
              description: 'Test product for E2E',
              category: 'Test Category',
              images: [{
                id: 1,
                url: '/placeholder.jpg',
                image_path: '/placeholder.jpg',
                alt_text: 'Mock Product 1 Image',
                is_primary: true
              }],
              producer: { id: 1, name: 'Test Producer' },
              categories: [{ id: 1, name: 'Test Category' }],
              unit: 'kg',
              stock: 10
            },
            { 
              id: 2, 
              name: 'Mock Product 2', 
              price: 15.90,
              description: 'Another test product',
              category: 'Test Category',
              images: [{
                id: 2,
                url: '/placeholder.jpg',
                image_path: '/placeholder.jpg',
                alt_text: 'Mock Product 2 Image',
                is_primary: true
              }],
              producer: { id: 1, name: 'Test Producer' },
              categories: [{ id: 1, name: 'Test Category' }],
              unit: 'kg',
              stock: 5
            }
          ],
          meta: {
            current_page: 1,
            total: 2,
            per_page: 20
          }
        }) 
      });
    }

    // Orders endpoints
    if (url.includes('/orders')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          orderId: 'MOCK-ORDER-1', 
          status: 'confirmed',
          message: 'Order successfully placed'
        }) 
      });
    }

    // Login endpoints
    if (url.includes('/login')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({
          user: { 
            id: 1, 
            role: 'consumer', 
            email: 'test@dixis.local',
            name: 'Test Consumer'
          },
          token: 'mock_token'
        }) 
      });
    }

    // Default fallback for any other API calls
    return route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });

  // Intercept Next.js RSC (React Server Component) requests
  await page.route('**/?_rsc=*', async (route) => {
    return route.fulfill({ 
      status: 200, 
      contentType: 'text/x-component',
      body: '[]'
    });
  });

  // Intercept frontend route requests that might be failing
  await page.route('**/products/*', async (route) => {
    const url = route.request().url();
    
    // If this is an RSC request, handle it specially
    if (url.includes('_rsc=')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'text/x-component',
        body: '[]'
      });
    }
    
    // Otherwise continue to the normal Next.js handling
    return route.continue();
  });

  // Silence external image flakiness - Unsplash and other image services
  await page.route('**images.unsplash.com/**', async (route) => {
    return route.fulfill({ 
      status: 200, 
      contentType: 'image/png', 
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    });
  });

  await page.route('**via.placeholder.com/**', async (route) => {
    return route.fulfill({ 
      status: 200, 
      contentType: 'image/png', 
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    });
  });

  await page.route('**picsum.photos/**', async (route) => {
    return route.fulfill({ 
      status: 200, 
      contentType: 'image/jpeg', 
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    });
  });
});