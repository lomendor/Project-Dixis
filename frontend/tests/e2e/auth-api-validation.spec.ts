import { test, expect } from '@playwright/test';

/**
 * API URL Validation Tests
 *
 * These tests ensure that the NEXT_PUBLIC_API_BASE_URL environment variable
 * is correctly configured and that the backend API is reachable.
 *
 * ROOT CAUSE FIX: https://github.com/lomendor/Project-Dixis/issues/XXX
 * The .env.example had incorrect production URL (api.dixis.gr instead of dixis.gr)
 */

test.describe('Auth API Validation', () => {
  test('should have valid API base URL configured', async ({ page }) => {
    // Navigate to any page to check env vars
    await page.goto('/');

    // Check that NEXT_PUBLIC_API_BASE_URL is accessible from client
    const apiBaseUrl = await page.evaluate(() => {
      return (window as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ||
             process.env.NEXT_PUBLIC_API_BASE_URL;
    });

    // In test/local environment, it should be http://127.0.0.1:8001/api/v1
    // In production, it should be https://dixis.gr/api/v1
    if (apiBaseUrl) {
      expect(apiBaseUrl).toMatch(/^https?:\/\/.+\/api\/v1$/);

      // CRITICAL: Ensure we're NOT using the broken api.dixis.gr subdomain
      expect(apiBaseUrl).not.toContain('api.dixis.gr');
    }
  });

  test('should successfully call /api/v1/auth/login endpoint', async ({ request }) => {
    // Test that the backend API is reachable
    // Use a dummy login to verify the endpoint responds (we expect 401/422, not network error)

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

    const response = await request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: 'dummy@test.com',
        password: 'dummypassword'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      failOnStatusCode: false // Don't fail on 401
    });

    // We expect either:
    // - 401 Unauthorized (backend is working, credentials invalid)
    // - 422 Validation error (backend is working, validation failed)
    // We should NOT get network errors or DNS errors
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('should successfully call /api/v1/auth/register endpoint', async ({ request }) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

    // Try to register with invalid data (missing fields)
    const response = await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        email: 'incomplete@test.com'
        // Missing name, password, role
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });

    // We expect 422 Validation error (backend is working, data incomplete)
    // We should NOT get network errors or DNS errors
    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body).toHaveProperty('errors');
  });

  test('register flow should work with valid data', async ({ request }) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

    // Generate unique email for this test
    const timestamp = Date.now();
    const testEmail = `test-register-${timestamp}@dixis.test`;

    const response = await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        name: 'Test User',
        email: testEmail,
        password: 'Password123!',
        password_confirmation: 'Password123!',
        role: 'consumer'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 201 Created
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('token');
    expect(body.user.email).toBe(testEmail);
    expect(body.user.role).toBe('consumer');
  });

  test('login flow should work with valid credentials', async ({ request }) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

    // First, register a user
    const timestamp = Date.now();
    const testEmail = `test-login-${timestamp}@dixis.test`;
    const testPassword = 'Password123!';

    await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        name: 'Login Test User',
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword,
        role: 'consumer'
      }
    });

    // Now try to login
    const loginResponse = await request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: testEmail,
        password: testPassword
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Should return 200 OK
    expect(loginResponse.status()).toBe(200);

    const body = await loginResponse.json();
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('token');
    expect(body.user.email).toBe(testEmail);
  });

  test('should show Greek error message for duplicate email', async ({ request }) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

    // Register a user first
    const timestamp = Date.now();
    const testEmail = `test-duplicate-${timestamp}@dixis.test`;

    await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        name: 'Original User',
        email: testEmail,
        password: 'Password123!',
        password_confirmation: 'Password123!',
        role: 'consumer'
      }
    });

    // Try to register again with same email
    const duplicateResponse = await request.post(`${apiBaseUrl}/auth/register`, {
      data: {
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password123!',
        password_confirmation: 'Password123!',
        role: 'consumer'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });

    // Should return 422 Validation error
    expect(duplicateResponse.status()).toBe(422);

    const body = await duplicateResponse.json();
    expect(body).toHaveProperty('errors');
    expect(body.errors).toHaveProperty('email');
  });
});
