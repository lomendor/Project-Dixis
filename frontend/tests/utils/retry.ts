/**
 * Retry utilities for test stability (tests-only, no production usage)
 * Pass 64: Scaffold for Retry Logic sprint
 */

/**
 * Attempts an async operation with retry logic
 * @param fn - Function to execute
 * @param options - Retry configuration
 * @returns Result of successful execution
 * @throws Last error if all retries exhausted
 */
export async function attempt<T>(
  fn: () => Promise<T>,
  { retries = 1, delay = 400 }: { retries?: number; delay?: number } = {}
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/**
 * Waits for element content to stabilize (stop changing)
 * Useful for detecting when dynamic content has finished loading
 * @param page - Playwright page object
 * @param locator - Element locator
 * @param timeout - Maximum wait time in ms
 * @returns true if stabilized, false if timeout
 */
export async function waitForStable(
  page: any,
  locator: any,
  timeout = 5000
): Promise<boolean> {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < timeout) {
    const txt = await locator.textContent().catch(() => '');
    if (txt && txt === last) return true;
    last = txt || '';
    await page.waitForTimeout(150);
  }
  return false;
}

/**
 * Exponential backoff delay calculator
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in ms
 * @param maxDelay - Maximum delay cap in ms
 * @returns Delay in ms with jitter
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay = 100,
  maxDelay = 5000
): number {
  const exponential = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.3 * exponential; // 30% jitter
  return Math.floor(exponential + jitter);
}
