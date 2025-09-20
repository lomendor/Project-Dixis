/**
 * Lean API mocks for E2E cart testing using Playwright route stubs
 */

import type { Page } from '@playwright/test';

const ok = (body: any) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body)
});

export async function registerSmokeStubs(page: Page) {
  await page.route('**/api/v1/auth/me', r => r.fulfill(ok({
    id: 1,
    name: 'Test User',
    email: 'test@dixis.local',
    role: 'consumer'
  })));

  // Products: return { data: [...] } format (expected by frontend)
  await page.route('**/api/v1/public/products**', r => r.fulfill(ok({
    data: [{
      id: 101,
      name: 'Demo Product',
      slug: 'demo-product',
      price: 3.5,
      currency: 'EUR',
      images: [{ url: '/img/demo.jpg', alt: 'Demo Product' }],
      categories: [{ id: 1, name: 'Oils', slug: 'oils' }],
      producer: { id: 1, name: 'Local Producer' },
      brand: 'Dixis',
      stock: 10,
      inStock: true,
      description: 'Mock demo product'
    }],
    total: 1,
    page: 1
  })));

  // Cart endpoints - empty for smoke test
  await page.route('**/api/v1/cart**', r => r.fulfill(ok({
    items: [],
    summary: { itemsCount: 0, subtotal: 0, currency: 'EUR' }
  })));

  // Categories, producers, search - minimal endpoints
  await page.route('**/api/v1/categories**', r => r.fulfill(ok({
    data: [{ id: 1, name: 'Oils', slug: 'oils' }],
    total: 1
  })));

  await page.route('**/api/v1/producers**', r => r.fulfill(ok([])));
  await page.route('**/api/v1/search**', r => r.fulfill(ok([])));
}

// Keep old function as alias for compatibility
export const setupCartApiMocks = registerSmokeStubs;