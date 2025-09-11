/**
 * E2E Auth-Cart Mock Setup
 * Minimal API stubs for role-based cart access testing
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    
    // Products - basic product list for testing
    if (url.includes('/products') && !url.match(/\/\d+$/)) {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            { id: 1, name: 'Mock Product', price: '10.00', images: [{ url: '/placeholder.jpg' }], producer: { name: 'Producer' } }
          ],
          meta: { total: 1 }
        })
      });
    }
    
    // Cart - role-based access control
    if (url.includes('/cart')) {
      const authToken = route.request().headers()['authorization']?.replace('Bearer ', '') || '';
      if (!authToken) {
        return route.fulfill({ status: 401, body: JSON.stringify({ message: 'Auth required' }) });
      }
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ items: [], total_items: 3, total_amount: '35.00' })
      });
    }
    
    // Auth - role detection for cart tests
    if (url.includes('/auth/me')) {
      const authToken = route.request().headers()['authorization']?.replace('Bearer ', '') || '';
      let userRole = 'guest';
      
      if (authToken.includes('consumer')) userRole = 'consumer';
      else if (authToken.includes('producer')) userRole = 'producer';
      else return route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthenticated' }) });
      
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          id: 1, 
          role: userRole, 
          profile: { role: userRole } 
        })
      });
    }
    
    route.continue();
  });
});