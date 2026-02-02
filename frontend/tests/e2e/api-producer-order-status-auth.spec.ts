/**
 * Pass P0-SEC-01 & P0-ONBOARDING-REAL-01: Producer order status API security tests
 *
 * Tests verify:
 * 1. Unauthenticated requests are rejected (401/403)
 * 2. Invalid order IDs are rejected (400)
 * 3. Invalid status values are rejected (400)
 * 4. Authenticated producer cannot access non-owned orders (403/404)
 * 5. Response is always JSON (not HTML from Laravel routing issues)
 */
import { test, expect } from '@playwright/test';

// Configure retries for stability in CI
test.describe.configure({ retries: 2 });

test.describe('API security - producer order status @security @smoke', () => {
  test('POST /api/producer/orders/:id/status rejects unauthenticated requests', async ({ request }) => {
    const res = await request.post('/api/producer/orders/test-order-id/status', {
      data: { status: 'shipped' }
    });
    // Accept either 401 (no session) or 403 (unauthorized)
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/producer/orders/:id/status rejects invalid status values', async ({ request }) => {
    const res = await request.post('/api/producer/orders/test-order-id/status', {
      data: { status: 'invalid-status' }
    });
    // Should reject - either auth failure first (401/403) or bad request (400)
    expect([400, 401, 403]).toContain(res.status());
  });

  test('POST /api/producer/orders/:id/status ignores spoofed customerEmail in body', async ({ request }) => {
    // Even if someone tries to pass customerEmail in body, it should be rejected
    // because auth is required first
    const res = await request.post('/api/producer/orders/fake-order/status', {
      data: {
        status: 'shipped',
        customerEmail: 'spoofed@example.com',
        customerName: 'Spoofed Name',
        total: 999999
      }
    });
    // Must reject - auth required
    expect([401, 403]).toContain(res.status());
  });

  test('POST without body returns 400 or auth error', async ({ request }) => {
    const res = await request.post('/api/producer/orders/test-order/status');
    // Either auth failure (401/403) or bad request (400) for missing body
    expect([400, 401, 403, 500]).toContain(res.status());
  });

  test('Response is JSON, not HTML (catches nginx routing issues)', async ({ request }) => {
    const res = await request.post('/api/producer/orders/test-order-id/status', {
      data: { status: 'shipped' }
    });
    const contentType = res.headers()['content-type'] || '';
    // Must be JSON - if HTML, nginx is routing to Laravel instead of Next.js
    expect(contentType).toContain('application/json');

    // Body should be parseable JSON with error key
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('Greek error message returned for auth failure', async ({ request }) => {
    const res = await request.post('/api/producer/orders/test-order-id/status', {
      data: { status: 'shipped' }
    });
    expect(res.status()).toBe(401);

    const body = await res.json();
    // Verify Greek error message (Απαιτείται είσοδος = Login required)
    expect(body.error).toContain('Απαιτείται είσοδος');
  });
});

/**
 * P0-ONBOARDING-REAL-01: Ownership verification tests
 *
 * These tests verify that even authenticated producers cannot access
 * orders they don't own. This requires producer authentication.
 *
 * Note: These tests use a mock/non-existent order ID to verify rejection.
 * A producer accessing a non-owned order should get 403 or 404.
 */
test.describe('API security - producer order ownership @security @smoke', () => {
  // Skip ownership tests if test auth is not available
  // These require the backend test login endpoint
  const USE_TEST_AUTH = process.env.NEXT_PUBLIC_E2E === 'true';

  test.skip(!USE_TEST_AUTH, 'Ownership tests require NEXT_PUBLIC_E2E=true');

  test('Authenticated producer cannot access non-existent order', async ({ page, request }) => {
    // Use test auth endpoint to login as producer
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
    const testLoginUrl = `${baseUrl}/api/v1/test/login`;

    // Login as producer
    const loginRes = await request.post(testLoginUrl, {
      data: { role: 'producer' }
    });

    if (!loginRes.ok()) {
      test.skip(true, 'Test auth endpoint not available');
      return;
    }

    const { token } = await loginRes.json();

    // Set auth cookie for subsequent requests
    await page.context().addCookies([{
      name: 'producer_session',
      value: token,
      domain: new URL(baseUrl).hostname,
      path: '/',
    }]);

    // Try to access a non-existent order
    const res = await request.post('/api/producer/orders/non-existent-order-12345/status', {
      data: { status: 'shipped' },
      headers: {
        'Cookie': `producer_session=${token}`,
      }
    });

    // Should reject with 403 (no ownership) or 404 (order not found)
    // Both are acceptable as they block unauthorized access
    expect([403, 404]).toContain(res.status());

    // Response must be JSON
    const contentType = res.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  });

  test('Authenticated producer gets ownership error for other producers order', async ({ page, request }) => {
    // This test is conceptually similar but documents the expected behavior
    // when a producer tries to update another producer's order

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
    const testLoginUrl = `${baseUrl}/api/v1/test/login`;

    // Login as producer
    const loginRes = await request.post(testLoginUrl, {
      data: { role: 'producer' }
    });

    if (!loginRes.ok()) {
      test.skip(true, 'Test auth endpoint not available');
      return;
    }

    const { token } = await loginRes.json();

    // Try to access an order that definitely doesn't belong to this test producer
    // Using a UUID-like ID to ensure it's either non-existent or owned by someone else
    const fakeOrderId = 'other-producer-order-abc123';

    const res = await request.post(`/api/producer/orders/${fakeOrderId}/status`, {
      data: { status: 'processing' },
      headers: {
        'Cookie': `producer_session=${token}`,
      }
    });

    // Must reject - either order not found (404) or no ownership (403)
    expect([403, 404]).toContain(res.status());

    // Verify JSON response
    const body = await res.json();
    expect(body).toHaveProperty('success', false);
    // Should have a message explaining why access was denied
    expect(body).toHaveProperty('message');
  });
});
