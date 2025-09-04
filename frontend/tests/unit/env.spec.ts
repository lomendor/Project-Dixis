import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Environment Validation Tests
 * 
 * Tests for runtime environment variable validation
 */

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to test fresh env loading
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate valid environment variables', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8001/api/v1',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3001',
      NEXT_PUBLIC_LOCALE: 'en',
      NODE_ENV: 'test',
    };

    const { env } = await import('@/lib/env');
    
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe('http://localhost:8001/api/v1');
    expect(env.NEXT_PUBLIC_BASE_URL).toBe('http://localhost:3001');
    expect(env.NEXT_PUBLIC_LOCALE).toBe('en');
    expect(env.NODE_ENV).toBe('test');
  });

  it('should use defaults for missing optional variables', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_BASE_URL: undefined,
      NEXT_PUBLIC_BASE_URL: undefined,
      NEXT_PUBLIC_LOCALE: undefined,
      NODE_ENV: undefined,
    };

    const { env } = await import('@/lib/env');
    
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe('http://127.0.0.1:8001/api/v1');
    expect(env.NEXT_PUBLIC_BASE_URL).toBe('http://127.0.0.1:3001');
    expect(env.NEXT_PUBLIC_LOCALE).toBe('en');
    expect(env.NODE_ENV).toBe('development');
  });

  it('should reject invalid URL formats', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_BASE_URL: 'invalid-url',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3001',
      NEXT_PUBLIC_LOCALE: 'en',
      NODE_ENV: 'development',
    };

    await expect(async () => {
      await import('@/lib/env');
    }).rejects.toThrow('Environment validation failed');
  });

  it('should validate environment helper functions', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      NEXT_PUBLIC_LOCALE: 'el',
    };

    const { isProduction, isDevelopment, isTest } = await import('@/lib/env');
    
    expect(isProduction).toBe(true);
    expect(isDevelopment).toBe(false); 
    expect(isTest).toBe(false);
  });
});