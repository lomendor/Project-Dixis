/**
 * E2E Unified Mock Setup
 * Comprehensive API mocking for smoke tests + role-based cart access
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Unified API route mocking for E2E tests
  // Match both relative /api/ and absolute http://*/api/ URLs
  await page.route(/\/(api|v1)\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const authHeader = route.request().headers()['authorization'];
    const authToken = authHeader?.replace('Bearer ', '') || '';

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
      if (!authToken) {
        return route.fulfill({ status: 401, body: JSON.stringify({ message: 'Auth required' }) });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total_items: 0, total_amount: '0.00' })
      });
    }

    // Auth endpoints - role detection and guest handling
    if (url.includes('/auth/me') || url.includes('/auth/profile')) {
      const hasStorageState = route.request().headers()['x-storage-state'] === 'consumer';
      
      // Return 401 for guest tests (no auth header and no storage state)
      if (!authToken && !hasStorageState) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthenticated' })
        });
      }
      
      // Role detection for authenticated users
      let userRole = 'guest';
      if (authToken.includes('consumer')) userRole = 'consumer';
      else if (authToken.includes('producer')) userRole = 'producer';
      else if (!authToken) {
        return route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthenticated' }) });
      }
      
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, role: userRole, email: 'test@example.com', name: 'Test User', profile: { role: userRole } })
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
      body: JSON.stringify({ success: true, message: 'E2E test mock' })
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