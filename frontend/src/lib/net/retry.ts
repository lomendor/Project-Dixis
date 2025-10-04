/**
 * Retry utility with exponential backoff for network operations
 * Pass 66: CheckoutApiClient retry-with-backoff implementation
 */

export type RetryOpts = {
  maxRetries?: number;         // default 2
  baseMs?: number;             // default 200
  method?: string;             // 'GET' | 'POST' | ...
  url?: string;                // for logging/debugging
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.floor(Math.random() * ms * 0.5);

/**
 * Wraps an async operation with retry logic and exponential backoff
 *
 * Retry policy:
 * - Always retry: 502, 503, 504 (transient server errors)
 * - Retry on GET only: other 5xx errors
 * - Always retry: Network errors (TypeError, ECONNRESET, ETIMEDOUT)
 * - Never retry: 4xx errors (client errors)
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOpts = {}): Promise<T> {
  const max = Number(process.env.CHECKOUT_API_RETRIES ?? opts.maxRetries ?? 2);
  const base = Number(process.env.CHECKOUT_API_RETRY_BASE_MS ?? opts.baseMs ?? 200);
  let lastErr: any;

  for (let attempt = 0; attempt <= max; attempt++) {
    try {
      const res: any = await fn();

      // If result is a Response object, evaluate status for retry
      if (res && typeof res === 'object' && 'ok' in res && 'status' in res) {
        const method = (opts.method || 'GET').toUpperCase();
        const st = (res as Response).status;

        // Retry for transient errors: 502/503/504 always. For other 5xx only on GET.
        const shouldRetry = st === 502 || st === 503 || st === 504 || (st >= 500 && st < 600 && method === 'GET');

        if (shouldRetry && attempt < max) {
          await sleep(jitter(base * Math.pow(2, attempt)));
          continue;
        }
      }

      return res;
    } catch (e: any) {
      lastErr = e;

      // Retry only on network-like errors (TypeError/ECONNRESET/ETIMEDOUT)
      const msg = String(e?.message || '');
      const isNet = e?.name === 'TypeError' || /ECONN|ETIMEDOUT|network|fetch failed/i.test(msg);

      if (!isNet || attempt >= max) throw e;

      await sleep(jitter(base * Math.pow(2, attempt)));
    }
  }

  throw lastErr;
}
