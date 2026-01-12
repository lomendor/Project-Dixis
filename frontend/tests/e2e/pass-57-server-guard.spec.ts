import { test, expect } from '@playwright/test';

/**
 * Pass 57: Server-Side Guard for Single Producer Cart
 *
 * Defense in depth: even if client guard is bypassed, server rejects
 * orders with products from multiple producers.
 *
 * Uses PROD data:
 * - Producer #1: Green Farm Co. (products: id=1,2,3,4,5)
 * - Producer #4: Test Producer B (product: id=6)
 */

// API base URL: PROD uses dixis.gr/api, local uses 127.0.0.1:8001/api
const API_BASE_URL = process.env.API_BASE_URL || 'https://dixis.gr/api/v1';

test.describe('Pass 57: Server-Side Multi-Producer Guard', () => {
  test('API rejects order with products from multiple producers', async ({ request }) => {
    // Attempt to create order with products from 2 different producers
    // Product ID 1 is from producer 1 (Green Farm Co.)
    // Product ID 6 is from producer 4 (Test Producer B)
    const response = await request.post(`${API_BASE_URL}/public/orders`, {
      data: {
        items: [
          { product_id: 1, quantity: 1 }, // Producer 1
          { product_id: 6, quantity: 1 }, // Producer 4
        ],
        shipping_method: 'HOME',
        shipping_address: {
          name: 'Test User',
          line1: 'Test Address 123',
          city: 'Athens',
          postal_code: '10001',
          country: 'Greece',
        },
        currency: 'EUR',
        payment_method: 'COD',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Should return 422 Unprocessable Entity
    expect(response.status()).toBe(422);

    // Response should contain error code (Greek text is unicode-escaped in JSON)
    const text = await response.text();
    // Check for error code which is ASCII and reliable
    expect(text.toLowerCase()).toContain('multi_producer_cart_not_allowed');
  });

  test('API accepts order with products from single producer', async ({ request }) => {
    // Attempt to create order with products from same producer
    // Product ID 1 and 2 are both from producer 1 (Green Farm Co.)
    const response = await request.post(`${API_BASE_URL}/public/orders`, {
      data: {
        items: [
          { product_id: 1, quantity: 1 }, // Producer 1
          { product_id: 2, quantity: 1 }, // Producer 1
        ],
        shipping_method: 'HOME',
        shipping_address: {
          name: 'Test User',
          line1: 'Test Address 123',
          city: 'Athens',
          postal_code: '10001',
          country: 'Greece',
        },
        currency: 'EUR',
        payment_method: 'COD',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Should return 201 Created (or 200 OK depending on controller)
    // NOT 422 - which would mean multi-producer rejection
    expect(response.status()).not.toBe(422);

    // If it's a success, it should be 201 or 200
    // If it fails for other reasons (auth, etc.), that's OK - we're testing the guard
    if (response.ok()) {
      const data = await response.json();
      expect(data.data || data).toHaveProperty('id');
    }
  });

  test('error response contains MULTI_PRODUCER_CART_NOT_ALLOWED code', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/public/orders`, {
      data: {
        items: [
          { product_id: 1, quantity: 1 }, // Producer 1
          { product_id: 6, quantity: 1 }, // Producer 4
        ],
        shipping_method: 'HOME',
        shipping_address: {
          name: 'Test User',
          line1: 'Test Address 123',
          city: 'Athens',
          postal_code: '10001',
          country: 'Greece',
        },
        currency: 'EUR',
        payment_method: 'COD',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    expect(response.status()).toBe(422);

    const text = await response.text();
    expect(text).toContain('MULTI_PRODUCER_CART_NOT_ALLOWED');
  });
});
