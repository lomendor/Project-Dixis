/**
 * MSW Stubs for E2E Testing
 * Provides deterministic API mocking using Playwright page.route()
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();

    // Authentication endpoints
    if (url.includes('/auth/me')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          id: 1, 
          role: 'consumer', 
          email: 'test@dixis.local',
          name: 'Test Consumer' 
        }) 
      });
    }

    // Cart endpoints - return mock cart with single item
    if (url.includes('/cart')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          items: [{ 
            id: 101, 
            name: 'Mock Product', 
            qty: 1, 
            price: 12.90,
            total: 12.90 
          }],
          itemsCount: 1,
          total: 12.90
        }) 
      });
    }

    // Products endpoints
    if (url.includes('/products')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify([{ 
          id: 1, 
          name: 'Mock Product', 
          price: 12.90,
          description: 'Test product for E2E',
          category: 'Test Category'
        }]) 
      });
    }

    // Checkout and orders endpoints
    if (url.includes('/checkout') || url.includes('/orders')) {
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

    // Default fallback for any other API calls
    return route.fulfill({ 
      status: 200, 
      contentType: 'application/json',
      body: JSON.stringify({}) 
    });
  });
});