type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export async function rateLimit(
  key: string,
  maxPerMinute = 30
): Promise<boolean> {
  // Ενεργό μόνο σε production — σε dev/CI είναι no-op
  if (process.env.NODE_ENV !== 'production') return true;
  const now = Date.now();
  const refillPerMs = maxPerMinute / 60000; // tokens per ms
  const b = buckets.get(key) ?? { tokens: maxPerMinute, last: now };
  const elapsed = Math.max(0, now - b.last);
  b.tokens = Math.min(maxPerMinute, b.tokens + elapsed * refillPerMs);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return true;
  }
  buckets.set(key, b);
  return false;
}
