/**
 * Checkout API Retry Logic Tests
 * Pass 66: Verify retry-with-backoff behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff } from '../checkout';

describe('retryWithBackoff - Pass 66', () => {
  describe('HTTP Status Code Retry Logic', () => {
    it('retries 502 Bad Gateway and succeeds on second attempt', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) {
          return { status: 502, ok: false } as Response;
        }
        return { status: 200, ok: true, json: async () => ({ success: true }) } as Response;
      });

      const result = await retryWithBackoff(mockFn, {
        retries: 2,
        baseMs: 1,
        jitter: false,
        method: 'GET'
      });

      expect(calls).toBe(2);
      expect((result as Response).status).toBe(200);
    });

    it('retries 503 Service Unavailable', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) return { status: 503 } as Response;
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1, method: 'POST' });
      expect(calls).toBe(2);
    });

    it('retries 504 Gateway Timeout', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) return { status: 504 } as Response;
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1 });
      expect(calls).toBe(2);
    });

    it('does NOT retry 500 on POST (only GET)', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        return { status: 500 } as Response;
      });

      const result = await retryWithBackoff(mockFn, {
        retries: 2,
        baseMs: 1,
        method: 'POST'
      });

      expect(calls).toBe(1); // No retry on POST 500
      expect((result as Response).status).toBe(500);
    });

    it('DOES retry 500 on GET', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) return { status: 500 } as Response;
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1, method: 'GET' });
      expect(calls).toBe(2);
    });

    it('does NOT retry 4xx client errors', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        return { status: 400 } as Response;
      });

      const result = await retryWithBackoff(mockFn, { retries: 2, baseMs: 1 });
      expect(calls).toBe(1);
      expect((result as Response).status).toBe(400);
    });
  });

  describe('Network Error Retry Logic', () => {
    it('retries on TypeError (network error)', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) throw new TypeError('Failed to fetch');
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1 });
      expect(calls).toBe(2);
    });

    it('retries on ECONNRESET', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) {
          const err = new Error('socket hang up ECONNRESET');
          err.name = 'Error';
          throw err;
        }
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1 });
      expect(calls).toBe(2);
    });

    it('retries on ETIMEDOUT', async () => {
      let calls = 0;
      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) throw new Error('request ETIMEDOUT');
        return { status: 200 } as Response;
      });

      await retryWithBackoff(mockFn, { retries: 2, baseMs: 1 });
      expect(calls).toBe(2);
    });

    it('does NOT retry on non-network errors', async () => {
      const mockFn = vi.fn(async () => {
        throw new Error('Validation failed');
      });

      await expect(
        retryWithBackoff(mockFn, { retries: 2, baseMs: 1 })
      ).rejects.toThrow('Validation failed');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exponential Backoff', () => {
    it('applies exponential backoff with jitter', async () => {
      const delays: number[] = [];
      let calls = 0;

      const mockFn = vi.fn(async () => {
        calls++;
        if (calls <= 2) throw new TypeError('network error');
        return { status: 200 } as Response;
      });

      const start = Date.now();
      await retryWithBackoff(mockFn, { retries: 3, baseMs: 100, jitter: true });
      const duration = Date.now() - start;

      // With baseMs=100, backoff is: 100ms (attempt 1), 200ms (attempt 2)
      // With jitter (0.5x), range is 100-150ms and 200-300ms
      // Minimum total: 300ms, typical: ~350-450ms
      expect(duration).toBeGreaterThanOrEqual(200); // At least 2 delays
      expect(calls).toBe(3);
    });
  });

  describe('Abort Signal', () => {
    it('respects abort signal during retry', async () => {
      const controller = new AbortController();
      let calls = 0;

      const mockFn = vi.fn(async () => {
        calls++;
        if (calls === 1) {
          controller.abort(); // Abort after first call
          throw new TypeError('network error');
        }
        return { status: 200 } as Response;
      });

      await expect(
        retryWithBackoff(mockFn, {
          retries: 3,
          baseMs: 1,
          abortSignal: controller.signal
        })
      ).rejects.toThrow('Request aborted');

      expect(calls).toBe(1); // Should not retry after abort
    });
  });
});
