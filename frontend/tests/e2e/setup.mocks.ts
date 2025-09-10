/**
 * Fallback E2E Stubs - Smoke Test Only
 * Ultra-minimal API mocking for smoke tests without backend dependency
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Fallback API route mocking for smoke tests
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Products endpoints
    if (url.includes('/products')) {
      if (url.match(/\/products\/\d+$/)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Mock Product',
            price: '12.50',
            description: 'Test product for smoke tests',
            images: [{ id: 1, url: '/placeholder.jpg', alt_text: 'Mock Product', is_primary: true }],
            producer: { id: 1, name: 'Mock Producer' }
          })
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Mock Product 1', price: '10.00', images: [{ id: 1, url: '/placeholder.jpg', is_primary: true }], producer: { name: 'Producer 1' } },
            { id: 2, name: 'Mock Product 2', price: '15.00', images: [{ id: 2, url: '/placeholder.jpg', is_primary: true }], producer: { name: 'Producer 2' } }
          ],
          meta: { current_page: 1, total: 2, per_page: 20 }
        })
      });
    }

    // Cart endpoints - role-based access control
    if (url.includes('/cart')) {
      const authHeader = route.request().headers()['authorization'];
      const authToken = authHeader?.replace('Bearer ', '') || '';
      
      // Guest users get 401
      if (!authToken) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Authentication required for cart access' })
        });
      }
      
      // Authenticated users (consumer/producer) get cart data
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          items: [
            { id: 1, product_id: 1, quantity: 2, product: { name: 'Mock Product 1', price: '10.00' } },
            { id: 2, product_id: 2, quantity: 1, product: { name: 'Mock Product 2', price: '15.00' } }
          ], 
          total_items: 3, 
          total_amount: '35.00' 
        })
      });
    }

    // Auth endpoints - role-based behavior for auth-cart flow tests
    if (url.includes('/auth/me') || url.includes('/auth/profile')) {
      // Detect auth state from cookies, localStorage, or headers
      const authHeader = route.request().headers()['authorization'];
      const hasStorageState = route.request().headers()['x-storage-state'] === 'consumer';
      
      // Check for role-specific auth tokens
      const authToken = authHeader?.replace('Bearer ', '') || '';
      let userRole = 'guest';
      
      if (authToken.includes('consumer') || hasStorageState) {
        userRole = 'consumer';
      } else if (authToken.includes('producer')) {
        userRole = 'producer';
      } else if (!authToken && !hasStorageState) {
        // Guest mode - return 401
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthenticated' })
        });
      }
      
      // Return authenticated user with appropriate role
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          id: 1, 
          role: userRole, 
          email: `test-${userRole}@example.com`, 
          name: `Test ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
          created_at: new Date().toISOString()
        })
      });
    }

    if (url.includes('/auth/login')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 1, role: 'consumer' }, token: 'mock_token' })
      });
    }

    // Orders endpoints
    if (url.includes('/orders')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'mock_order_1', status: 'pending', total: '25.00' })
      });
    }

    // Default fallback
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Smoke test mock' })
    });
  });

  // Image service mocks for smoke tests
  const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  await page.route('**images.unsplash.com/**', async (route) => route.fulfill({ status: 200, contentType: 'image/png', body: mockImageBuffer }));
  await page.route('**via.placeholder.com/**', async (route) => route.fulfill({ status: 200, contentType: 'image/png', body: mockImageBuffer }));
  await page.route('**picsum.photos/**', async (route) => route.fulfill({ status: 200, contentType: 'image/jpeg', body: mockImageBuffer }));

  // Next.js RSC requests
  await page.route('**/?_rsc=*', async (route) => route.fulfill({ status: 200, contentType: 'text/x-component', body: '[]' }));
});