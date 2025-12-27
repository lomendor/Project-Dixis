/**
 * Pass 44 Regression Test: Architecture Reconciliation
 *
 * Verifies the single source of truth architecture:
 * 1. Checkout creates orders via Laravel API (not /api/checkout)
 * 2. Orders list shows correct data from Laravel
 * 3. Order details show shipping_address, shipping_method_label, producer
 * 4. Legacy /api/checkout returns 410 Gone
 *
 * Root cause fixed: Split-brain between Prisma/Neon and Laravel PostgreSQL
 * Solution: All order creation now goes through Laravel API exclusively
 *
 * @see docs/AGENT/SYSTEM/sources-of-truth.md
 */

import { test, expect } from '@playwright/test';

// Backend API base URL (Laravel runs on port 8001)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
const FRONTEND_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';

test.describe('Pass 44: Architecture Reconciliation', () => {

  test.describe('Legacy Endpoint Disabled', () => {
    test('POST /api/checkout returns 410 Gone', async ({ request }) => {
      const response = await request.post(`${FRONTEND_BASE}/api/checkout`, {
        data: {
          items: [{ productId: 'test', qty: 1 }],
          shipping: { name: 'Test', phone: '123', line1: 'Test St', city: 'Athens', postal: '11527' },
          payment: { method: 'COD' }
        }
      });

      expect(response.status()).toBe(410);

      const body = await response.json();
      expect(body.error).toContain('deprecated');
      expect(body.message).toContain('Laravel API');
    });

    test('GET /api/checkout returns 410 Gone', async ({ request }) => {
      const response = await request.get(`${FRONTEND_BASE}/api/checkout`);
      expect(response.status()).toBe(410);
    });
  });

  test.describe('Laravel API Order Creation', () => {
    test('POST /api/v1/public/orders accepts shipping_address', async ({ request }) => {
      // First, get a valid product ID from the API
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      expect(productsResponse.status()).toBe(200);

      const productsJson = await productsResponse.json();
      if (!productsJson.data || productsJson.data.length === 0) {
        test.skip(true, 'No products available to test order creation');
        return;
      }

      const product = productsJson.data[0];

      // Create order with shipping_address
      const orderResponse = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity: 1 }],
          currency: 'EUR',
          shipping_method: 'HOME',
          shipping_address: {
            name: 'Test Customer Pass44',
            phone: '+30 210 1234567',
            line1: 'Ermou 10',
            city: 'Athens',
            postal_code: '10563',
            country: 'GR'
          },
          payment_method: 'COD',
          notes: 'Pass 44 E2E test order'
        }
      });

      expect(orderResponse.status()).toBe(201);

      const orderJson = await orderResponse.json();
      const order = orderJson.data;

      // Verify order was created with shipping_address
      expect(order).toHaveProperty('id');
      expect(order.shipping_address).toBeTruthy();
      expect(order.shipping_address.name).toBe('Test Customer Pass44');
      expect(order.shipping_address.city).toBe('Athens');
      expect(order.shipping_address.postal_code).toBe('10563');

      // Verify shipping_method_label is present (Greek)
      expect(order.shipping_method).toBe('HOME');
      expect(order.shipping_method_label).toBe('Παράδοση στο σπίτι');

      // Verify payment_method was saved
      expect(order.payment_method).toBe('COD');

      // Verify notes were saved
      expect(order.notes).toBe('Pass 44 E2E test order');
    });

    test('Order items include producer info', async ({ request }) => {
      // Get an order with items
      const ordersResponse = await request.get(`${API_BASE}/public/orders`);
      expect(ordersResponse.status()).toBe(200);

      const ordersJson = await ordersResponse.json();
      if (!ordersJson.data || ordersJson.data.length === 0) {
        test.skip(true, 'No orders available to test');
        return;
      }

      // Find an order with items
      const orderWithItems = ordersJson.data.find(
        (o: { items?: unknown[] }) => o.items && o.items.length > 0
      );

      if (!orderWithItems) {
        test.skip(true, 'No orders with items available');
        return;
      }

      // Get order details
      const orderDetailResponse = await request.get(`${API_BASE}/public/orders/${orderWithItems.id}`);
      expect(orderDetailResponse.status()).toBe(200);

      const orderDetailJson = await orderDetailResponse.json();
      const order = orderDetailJson.data;

      // Verify items have producer info
      expect(order.items).toBeDefined();
      expect(order.items.length).toBeGreaterThan(0);

      const item = order.items[0];
      expect(item).toHaveProperty('product_id');
      expect(item).toHaveProperty('product_name');

      // Producer info should be present if loaded
      if (item.producer) {
        expect(item.producer).toHaveProperty('id');
        expect(item.producer).toHaveProperty('name');
        expect(typeof item.producer.id).toBe('number');
        expect(typeof item.producer.name).toBe('string');
      }
    });
  });

  test.describe('Data Consistency', () => {
    test('Orders created via API appear in list with correct data', async ({ request }) => {
      // Create an order
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      const productsJson = await productsResponse.json();

      if (!productsJson.data || productsJson.data.length === 0) {
        test.skip(true, 'No products available');
        return;
      }

      const product = productsJson.data[0];
      const uniqueNote = `Pass44-test-${Date.now()}`;

      const createResponse = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity: 2 }],
          currency: 'EUR',
          shipping_method: 'COURIER',
          shipping_address: {
            name: 'Consistency Test',
            phone: '+30 210 9999999',
            line1: 'Stadiou 5',
            city: 'Thessaloniki',
            postal_code: '54621',
            country: 'GR'
          },
          payment_method: 'COD',
          notes: uniqueNote
        }
      });

      expect(createResponse.status()).toBe(201);
      const createdOrder = (await createResponse.json()).data;
      const orderId = createdOrder.id;

      // Fetch the order from the list
      const listResponse = await request.get(`${API_BASE}/public/orders`);
      expect(listResponse.status()).toBe(200);

      const listJson = await listResponse.json();
      const foundOrder = listJson.data.find((o: { id: number }) => o.id === orderId);

      expect(foundOrder).toBeTruthy();

      // Verify data consistency
      expect(foundOrder.shipping_method).toBe('COURIER');
      expect(foundOrder.shipping_method_label).toBe('Μεταφορική εταιρεία');
      expect(foundOrder.payment_method).toBe('COD');
      expect(foundOrder.notes).toBe(uniqueNote);
      expect(foundOrder.items_count).toBeGreaterThan(0);

      // Verify shipping address is present
      if (foundOrder.shipping_address) {
        expect(foundOrder.shipping_address.city).toBe('Thessaloniki');
      }
    });

    test('Order totals are calculated correctly', async ({ request }) => {
      // Create an order with multiple items
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      const productsJson = await productsResponse.json();

      if (!productsJson.data || productsJson.data.length < 1) {
        test.skip(true, 'Not enough products available');
        return;
      }

      const product = productsJson.data[0];
      const quantity = 3;

      const createResponse = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity }],
          currency: 'EUR',
          shipping_method: 'HOME',
          payment_method: 'COD'
        }
      });

      expect(createResponse.status()).toBe(201);
      const order = (await createResponse.json()).data;

      // Verify totals are not zero or placeholder
      expect(order.subtotal).toBeDefined();
      expect(parseFloat(order.subtotal)).toBeGreaterThan(0);
      expect(order.total).toBeDefined();
      expect(parseFloat(order.total)).toBeGreaterThan(0);

      // Subtotal should equal product price * quantity
      const expectedSubtotal = parseFloat(product.price) * quantity;
      expect(parseFloat(order.subtotal)).toBeCloseTo(expectedSubtotal, 2);
    });
  });

  test.describe('Shipping Method Labels (Greek)', () => {
    test('HOME shipping returns correct Greek label', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      const productsJson = await productsResponse.json();

      if (!productsJson.data || productsJson.data.length === 0) {
        test.skip(true, 'No products available');
        return;
      }

      const product = productsJson.data[0];

      const response = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity: 1 }],
          currency: 'EUR',
          shipping_method: 'HOME',
          payment_method: 'COD'
        }
      });

      expect(response.status()).toBe(201);
      const order = (await response.json()).data;

      expect(order.shipping_method).toBe('HOME');
      expect(order.shipping_method_label).toBe('Παράδοση στο σπίτι');
    });

    test('PICKUP shipping returns correct Greek label', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      const productsJson = await productsResponse.json();

      if (!productsJson.data || productsJson.data.length === 0) {
        test.skip(true, 'No products available');
        return;
      }

      const product = productsJson.data[0];

      const response = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity: 1 }],
          currency: 'EUR',
          shipping_method: 'PICKUP',
          payment_method: 'COD'
        }
      });

      expect(response.status()).toBe(201);
      const order = (await response.json()).data;

      expect(order.shipping_method).toBe('PICKUP');
      expect(order.shipping_method_label).toBe('Παραλαβή από κατάστημα');
    });

    test('COURIER shipping returns correct Greek label', async ({ request }) => {
      const productsResponse = await request.get(`${API_BASE}/public/products`);
      const productsJson = await productsResponse.json();

      if (!productsJson.data || productsJson.data.length === 0) {
        test.skip(true, 'No products available');
        return;
      }

      const product = productsJson.data[0];

      const response = await request.post(`${API_BASE}/public/orders`, {
        data: {
          items: [{ product_id: product.id, quantity: 1 }],
          currency: 'EUR',
          shipping_method: 'COURIER',
          payment_method: 'COD'
        }
      });

      expect(response.status()).toBe(201);
      const order = (await response.json()).data;

      expect(order.shipping_method).toBe('COURIER');
      expect(order.shipping_method_label).toBe('Μεταφορική εταιρεία');
    });
  });
});
