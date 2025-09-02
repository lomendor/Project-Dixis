import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Environment Validation', () => {
  it('should parse valid env (BASE_URL, API_BASE_URL, LOCALE)', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://127.0.0.1:8001/api/v1'),
      NEXT_PUBLIC_BASE_URL: z.string().url().default('http://127.0.0.1:3001'),
      NEXT_PUBLIC_LOCALE: z.enum(['en', 'el', 'en-US', 'el-GR']).default('en'),
    });

    const validEnv = {
      NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:8001/api/v1',
      NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:3001',
      NEXT_PUBLIC_LOCALE: 'en' as const,
    };

    const result = envSchema.parse(validEnv);

    expect(result.NEXT_PUBLIC_API_BASE_URL).toBe('http://127.0.0.1:8001/api/v1');
    expect(result.NEXT_PUBLIC_BASE_URL).toBe('http://127.0.0.1:3001');
    expect(result.NEXT_PUBLIC_LOCALE).toBe('en');
  });

  it('should throw on missing/invalid env (API_BASE_URL="")', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_API_BASE_URL: z.string().url(),
      NEXT_PUBLIC_BASE_URL: z.string().url().default('http://127.0.0.1:3001'),
    });

    const invalidEnv = {
      NEXT_PUBLIC_API_BASE_URL: '', // Invalid empty string
    };

    expect(() => {
      envSchema.parse(invalidEnv);
    }).toThrow();
  });

  it('should use defaults for optional values', () => {
    const envSchema = z.object({
      NEXT_PUBLIC_API_BASE_URL: z.string().url(),
      NEXT_PUBLIC_BASE_URL: z.string().url().default('http://127.0.0.1:3001'),
      NEXT_PUBLIC_LOCALE: z.enum(['en', 'el']).default('en'),
    });

    const minimalEnv = {
      NEXT_PUBLIC_API_BASE_URL: 'http://api.example.com/v1',
    };

    const result = envSchema.parse(minimalEnv);

    expect(result.NEXT_PUBLIC_API_BASE_URL).toBe('http://api.example.com/v1');
    expect(result.NEXT_PUBLIC_BASE_URL).toBe('http://127.0.0.1:3001'); // default
    expect(result.NEXT_PUBLIC_LOCALE).toBe('en'); // default
  });
});