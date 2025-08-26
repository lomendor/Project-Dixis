import { test, expect } from '@playwright/test';

/**
 * API Smoke Tests - FE↔API Integration
 * 
 * Tests core API endpoints that the frontend depends on.
 * These tests run against the actual backend API to ensure
 * FE↔API integration is working properly.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

test.describe('API Smoke Tests', () => {
  
  test('health endpoint returns success', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
  });

  test('public products endpoint returns array', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/public/products`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Should return paginated structure
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Pagination metadata
    expect(data).toHaveProperty('current_page');
    expect(data).toHaveProperty('per_page');
    expect(data).toHaveProperty('total');
    
    // For now, we expect an empty array since no products are seeded yet
    // This test will pass whether data is empty or populated
    expect(data.data.length).toBeGreaterThanOrEqual(0);
  });

  test('public products endpoint handles query parameters', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/public/products?per_page=5&page=1`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.per_page).toBe(5);
    expect(data.current_page).toBe(1);
  });

  test('health endpoint includes database connection status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Database should be connected
    expect(data.database).toBe('connected');
    
    // Timestamp should be recent (within last 10 seconds)
    const timestampMs = new Date(data.timestamp).getTime();
    const nowMs = new Date().getTime();
    const diffMs = nowMs - timestampMs;
    expect(diffMs).toBeLessThan(10000); // Less than 10 seconds
  });

  test('public products endpoint supports search functionality', async ({ request }) => {
    // Test search parameter (even if no results)
    const response = await request.get(`${API_BASE_URL}/v1/public/products?search=test`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('public products endpoint supports category filtering', async ({ request }) => {
    // Test category filter parameter (even if no results)
    const response = await request.get(`${API_BASE_URL}/v1/public/products?category=vegetables`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });
});

test.describe('API Error Handling', () => {
  
  test('handles non-existent endpoints gracefully', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/v1/non-existent-endpoint`);
    
    // Should return 404, not crash
    expect(response.status()).toBe(404);
  });

  test('protected endpoints return proper authentication error', async ({ request }) => {
    // Test KPI endpoint without authentication
    const response = await request.get(`${API_BASE_URL}/v1/producer/dashboard/kpi`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('Unauthenticated');
  });
});