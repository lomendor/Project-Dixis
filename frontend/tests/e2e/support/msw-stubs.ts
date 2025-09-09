/**
 * Enhanced MSW Stubs for E2E Testing
 * Stabilizes flaky tests: shipping-integration, auth-edge-cases, checkout-happy-path
 */

import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Stateful test data for enhanced stability
  let testState = {
    auth: { authenticated: false, user: null, token: null },
    cart: { items: [], total: 0, itemsCount: 0 },
    orders: [] as any[]
  };

  // Main API interceptor
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Auth endpoints with stateful management
    if (url.includes('/auth/login') && method === 'POST') {
      const requestBody = await route.request().postDataJSON().catch(() => ({}));
      if (requestBody.email === 'consumer@example.com' && requestBody.password === 'password') {
        testState.auth = {
          authenticated: true,
          user: { id: 1, role: 'consumer', email: 'consumer@example.com', name: 'Test Consumer' },
          token: `token_${Date.now()}`
        };
        return route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ user: testState.auth.user, token: testState.auth.token, success: true })
        });
      }
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid credentials' }) });
    }

    if (url.includes('/auth/logout') && method === 'POST') {
      testState.auth = { authenticated: false, user: null, token: null };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }

    if (url.includes('/auth/me') || url.includes('/auth/profile')) {
      if (testState.auth.authenticated) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testState.auth.user) });
      }
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Not authenticated' }) });
    }

    // Cart endpoints with state management
    if (url.includes('/cart/items') && method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(testState.cart) });
    }

    if (url.includes('/cart/add') && method === 'POST') {
      const requestBody = await route.request().postDataJSON().catch(() => ({}));
      const newItem = {
        id: testState.cart.items.length + 1,
        product: { id: requestBody.product_id || 1, name: 'Greek Oil', price: '15.50', producer: { name: 'Producer' } },
        quantity: requestBody.quantity || 1,
        subtotal: ((requestBody.quantity || 1) * 15.50).toFixed(2)
      };
      testState.cart.items.push(newItem);
      testState.cart.itemsCount += newItem.quantity;
      testState.cart.total = testState.cart.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, cart: testState.cart }) });
    }

    if (url.includes('/cart') && method === 'DELETE') {
      testState.cart = { items: [], total: 0, itemsCount: 0 };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }

    // Shipping endpoints for shipping-integration.spec.ts stability
    if (url.includes('/shipping/quote') && method === 'POST') {
      const requestBody = await route.request().postDataJSON().catch(() => ({}));
      const postalCode = requestBody.postal_code || requestBody.destination?.postal_code || '12345';
      
      if (!/^\d{5}$/.test(postalCode)) {
        return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'Μη έγκυρος ΤΚ (5 ψηφία)' }) });
      }

      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [
            { id: 'home', name: 'Home Delivery', description: 'Παράδοση στο σπίτι σας', price: 5.50, estimated_days: 2 },
            { id: 'express', name: 'Express Delivery', description: 'Ταχεία παράδοση', price: 12.00, estimated_days: 1 }
          ]
        })
      });
    }

    // Checkout endpoints for checkout-happy-path.spec.ts stability
    if (url.includes('/orders/checkout') && method === 'POST') {
      if (!testState.auth.authenticated) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Authentication required' }) });
      }

      const requestBody = await route.request().postDataJSON().catch(() => ({}));
      const orderId = `order_${Date.now()}`;
      const newOrder = {
        id: orderId,
        total_amount: '42.14',
        status: 'pending',
        payment_method: requestBody.payment_method || 'cod',
        shipping_method: requestBody.shipping_method || 'home',
        created_at: new Date().toISOString()
      };
      
      testState.orders.push(newOrder);
      testState.cart = { items: [], total: 0, itemsCount: 0 };
      
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ order: newOrder, success: true })
      });
    }

    if (url.includes('/orders/') && method === 'GET') {
      const orderIdMatch = url.match(/\/orders\/([^/?]+)/);
      if (orderIdMatch) {
        const orderId = orderIdMatch[1];
        const order = testState.orders.find(o => o.id === orderId);
        return route.fulfill({ 
          status: order ? 200 : 404, 
          contentType: 'application/json',
          body: JSON.stringify(order || { error: 'Order not found' })
        });
      }
    }

    // Enhanced search for filters-search.spec.ts stability
    if (url.includes('/products') && url.includes('search=')) {
      const searchParams = new URLSearchParams(url.split('?')[1] || '');
      const searchTerm = searchParams.get('search') || '';
      
      let filteredProducts = [];
      if (searchTerm.toLowerCase().includes('πορτοκάλια') || searchTerm.toLowerCase().includes('orange')) {
        filteredProducts = [
          { 
            id: 101, name: 'Πορτοκάλια E2E Test', price: 3.50, description: 'Φρέσκα πορτοκάλια για E2E testing',
            category: 'Φρούτα', images: [{ id: 1, url: '/placeholder.jpg', image_path: '/placeholder.jpg', alt_text: 'Πορτοκάλια', is_primary: true }],
            producer: { id: 1, name: 'E2E Producer' }, categories: [{ id: 1, name: 'Φρούτα' }], unit: 'kg', stock: 50
          }
        ];
      }
      
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ data: filteredProducts, meta: { current_page: 1, total: filteredProducts.length, per_page: 20 } })
      });
    }

    // Products endpoints
    if (url.includes('/products')) {
      if (url.match(/\/products\/\d+$/)) {
        const productId = url.split('/').pop();
        return route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ 
            id: parseInt(productId || '1'), name: `Mock Product ${productId}`, price: 12.90,
            description: 'Test product for E2E', category: 'Test Category',
            images: [{ id: 1, url: '/placeholder.jpg', image_path: '/placeholder.jpg', alt_text: `Mock Product ${productId} Image`, is_primary: true }],
            producer_id: 1, producer: { id: 1, name: 'Test Producer' }
          })
        });
      }
      
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { 
              id: 1, name: 'Mock Product 1', price: 12.90, description: 'Test product for E2E', category: 'Test Category',
              images: [{ id: 1, url: '/placeholder.jpg', image_path: '/placeholder.jpg', alt_text: 'Mock Product 1 Image', is_primary: true }],
              producer: { id: 1, name: 'Test Producer' }, categories: [{ id: 1, name: 'Test Category' }], unit: 'kg', stock: 10
            },
            { 
              id: 2, name: 'Mock Product 2', price: 15.90, description: 'Another test product', category: 'Test Category',
              images: [{ id: 2, url: '/placeholder.jpg', image_path: '/placeholder.jpg', alt_text: 'Mock Product 2 Image', is_primary: true }],
              producer: { id: 1, name: 'Test Producer' }, categories: [{ id: 1, name: 'Test Category' }], unit: 'kg', stock: 5
            }
          ],
          meta: { current_page: 1, total: 2, per_page: 20 }
        })
      });
    }

    // Analytics endpoints for analytics-observability.spec.ts stability
    if (url.includes('/analytics')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Event tracked' })
      });
    }

    // Legacy login endpoint
    if (url.includes('/login')) {
      return route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 1, role: 'consumer', email: 'test@dixis.local', name: 'Test Consumer' }, token: 'mock_token' })
      });
    }

    // Default fallback
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  // RSC and image intercepts
  await page.route('**/?_rsc=*', async (route) => route.fulfill({ status: 200, contentType: 'text/x-component', body: '[]' }));
  await page.route('**/products/*', async (route) => {
    const url = route.request().url();
    if (url.includes('_rsc=')) {
      return route.fulfill({ status: 200, contentType: 'text/x-component', body: '[]' });
    }
    return route.continue();
  });

  // Image service stubs
  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  await page.route('**images.unsplash.com/**', async (route) => route.fulfill({ status: 200, contentType: 'image/png', body: imageBuffer }));
  await page.route('**via.placeholder.com/**', async (route) => route.fulfill({ status: 200, contentType: 'image/png', body: imageBuffer }));
  await page.route('**picsum.photos/**', async (route) => route.fulfill({ status: 200, contentType: 'image/jpeg', body: imageBuffer }));
});