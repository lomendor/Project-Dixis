/**
 * Smoke Test API Stubs - Playwright Routes
 * Lightweight stubs for smoke tests to bypass MSW homepage compatibility issues
 */

import { Page } from '@playwright/test';

export async function registerSmokeStubs(page: Page) {
  // Products API stub - matches Laravel API structure with pagination
  await page.route('**/api/**/public/products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_page: 1,
        data: [
          {
            id: 1,
            name: 'Demo Product',
            price: '12.34',
            unit: 'kg',
            stock: 10,
            is_active: true,
            description: 'Test product for smoke tests',
            categories: [{ id: 1, name: 'Demo', slug: 'demo' }],
            images: [{ id: 1, url: '/demo.jpg', alt_text: 'Demo', is_primary: true }],
            producer: { id: 1, name: 'Demo Producer', business_name: 'Demo Business' }
          }
        ],
        first_page_url: 'http://127.0.0.1:8001/api/v1/public/products?page=1',
        from: 1,
        last_page: 1,
        last_page_url: 'http://127.0.0.1:8001/api/v1/public/products?page=1',
        links: [],
        next_page_url: null,
        path: 'http://127.0.0.1:8001/api/v1/public/products',
        per_page: 20,
        prev_page_url: null,
        to: 1,
        total: 1
      })
    });
  });

  // Auth endpoints
  await page.route('**/api/**/auth/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'consumer'
      })
    });
  });

  // Cart endpoints
  await page.route('**/api/**/cart/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json', 
      body: JSON.stringify({ items: [], total: 0 })
    });
  });
}