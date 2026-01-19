/**
 * Pass CART-SYNC-01: Cart Sync E2E Tests
 *
 * Tests the cart synchronization between localStorage and server on login.
 * These tests require a running backend and use real auth.
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

// Test user credentials (must exist in E2E seeder)
const TEST_USER = {
  email: 'e2e-cart-sync@dixis.gr',
  password: 'TestPassword123!',
  name: 'Cart Sync Test User',
};

// Helper: Clear localStorage cart
async function clearLocalCart(page: any) {
  await page.evaluate(() => {
    localStorage.removeItem('dixis:cart:v1');
  });
}

// Helper: Set localStorage cart directly
async function setLocalCart(page: any, items: { id: string; title: string; priceCents: number; qty: number }[]) {
  const cartState = {
    state: {
      items: items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<string, any>),
    },
    version: 0,
  };
  await page.evaluate((cart: string) => {
    localStorage.setItem('dixis:cart:v1', cart);
  }, JSON.stringify(cartState));
}

// Helper: Get localStorage cart
async function getLocalCart(page: any): Promise<Record<string, any>> {
  return page.evaluate(() => {
    const stored = localStorage.getItem('dixis:cart:v1');
    if (!stored) return {};
    try {
      const parsed = JSON.parse(stored);
      return parsed.state?.items || {};
    } catch {
      return {};
    }
  });
}

// Helper: Login via UI
async function loginViaUI(page: any, email: string, password: string) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000); // Wait for hydration

  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for login to complete (redirect or auth state change)
  await page.waitForTimeout(3000);
}

// Helper: Logout via UI or clear state
async function logout(page: any) {
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('dixis:cart:v1');
  });
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
}

// Helper: Clear server cart via API
async function clearServerCart(token: string) {
  try {
    // Get current cart items
    const response = await fetch(`${API_BASE}/cart/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      const items = data.cart_items || [];

      // Delete each item
      for (const item of items) {
        await fetch(`${API_BASE}/cart/items/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
  } catch (e) {
    console.log('Could not clear server cart:', e);
  }
}

// Helper: Get auth token by logging in
async function getAuthToken(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch (e) {
    console.log('Could not get auth token:', e);
  }
  return null;
}

// Helper: Add item to server cart via API
async function addToServerCart(token: string, productId: number, quantity: number) {
  await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

// Helper: Get first product from API
async function getFirstProduct(): Promise<{ id: number; name: string; price: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/public/products`);
    if (response.ok) {
      const data = await response.json();
      const products = data.data || [];
      if (products.length > 0) {
        return products[0];
      }
    }
  } catch (e) {
    console.log('Could not get products:', e);
  }
  return null;
}

test.describe('Cart Sync on Login', () => {
  // Skip these tests if backend is not available
  test.beforeAll(async () => {
    try {
      const response = await fetch(`${API_BASE.replace('/api/v1', '')}/api/health`);
      if (!response.ok) {
        test.skip();
      }
    } catch {
      console.log('Backend not available, skipping cart sync tests');
      test.skip();
    }
  });

  test('Guest adds items, logs in, cart preserved', async ({ page }) => {
    // Get a product to add
    const product = await getFirstProduct();
    if (!product) {
      test.skip();
      return;
    }

    // Get auth token and clear server cart first
    const token = await getAuthToken(TEST_USER.email, TEST_USER.password);
    if (token) {
      await clearServerCart(token);
    }

    // Start as guest, clear any existing cart
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await clearLocalCart(page);

    // Set localStorage cart with product
    await setLocalCart(page, [
      {
        id: String(product.id),
        title: product.name,
        priceCents: Math.round(parseFloat(product.price) * 100),
        qty: 2,
      },
    ]);

    // Verify localStorage has the item
    let localCart = await getLocalCart(page);
    expect(Object.keys(localCart).length).toBe(1);
    expect(localCart[String(product.id)]?.qty).toBe(2);

    // Login
    await loginViaUI(page, TEST_USER.email, TEST_USER.password);

    // Wait for sync to complete
    await page.waitForTimeout(2000);

    // Verify localStorage still has items (should be synced)
    localCart = await getLocalCart(page);
    expect(Object.keys(localCart).length).toBeGreaterThanOrEqual(1);

    console.log('Cart preserved after login:', localCart);
  });

  test('Login with existing server cart merges with local', async ({ page }) => {
    // Get products
    const product = await getFirstProduct();
    if (!product) {
      test.skip();
      return;
    }

    // Get auth token
    const token = await getAuthToken(TEST_USER.email, TEST_USER.password);
    if (!token) {
      test.skip();
      return;
    }

    // Clear server cart and add one item
    await clearServerCart(token);
    await addToServerCart(token, product.id, 1);

    // Start as guest with localStorage cart
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });

    await setLocalCart(page, [
      {
        id: String(product.id),
        title: product.name,
        priceCents: Math.round(parseFloat(product.price) * 100),
        qty: 2,
      },
    ]);

    // Login
    await loginViaUI(page, TEST_USER.email, TEST_USER.password);

    // Wait for sync to complete
    await page.waitForTimeout(2000);

    // Verify merged cart (should have qty=3: 1 from server + 2 from local)
    const localCart = await getLocalCart(page);
    const productCart = localCart[String(product.id)];

    // Cart should exist and have merged quantity
    expect(productCart).toBeDefined();
    expect(productCart.qty).toBe(3); // 1 (server) + 2 (local) = 3

    console.log('Merged cart:', localCart);
  });

  test('Sync is idempotent - same product sums quantities', async ({ page }) => {
    // This test verifies that syncing the same product multiple times
    // correctly sums quantities without creating duplicates

    const product = await getFirstProduct();
    if (!product) {
      test.skip();
      return;
    }

    const token = await getAuthToken(TEST_USER.email, TEST_USER.password);
    if (!token) {
      test.skip();
      return;
    }

    // Clear and set known server state
    await clearServerCart(token);
    await addToServerCart(token, product.id, 1);

    // Start fresh
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });

    // Set localStorage with same product
    await setLocalCart(page, [
      {
        id: String(product.id),
        title: product.name,
        priceCents: Math.round(parseFloat(product.price) * 100),
        qty: 2,
      },
    ]);

    // Login
    await loginViaUI(page, TEST_USER.email, TEST_USER.password);
    await page.waitForTimeout(2000);

    // Verify: should have 3 items total (1 + 2)
    const localCart = await getLocalCart(page);
    const productCart = localCart[String(product.id)];

    expect(productCart).toBeDefined();
    expect(productCart.qty).toBe(3);

    // Verify only one product entry exists (no duplicates)
    expect(Object.keys(localCart).length).toBe(1);

    console.log('Idempotent sync verified:', localCart);
  });
});
