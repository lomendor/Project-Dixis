import { prisma } from '@/lib/db/client';

export interface RL {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
}

/**
 * DB-backed rate limiting with time-bucket strategy
 *
 * @param name - Rate limit identifier (e.g., 'cron-run', 'dev-deliver')
 * @param key - Client identifier (e.g., IP address, cron key, user ID)
 * @param limit - Maximum requests per window
 * @param windowSec - Time window in seconds
 * @param burst - Burst multiplier (default 1)
 * @returns Rate limit result with ok status and headers data
 */
export async function rateLimit(
  name: string,
  key: string,
  limit: number,
  windowSec: number,
  burst = 1
): Promise<RL> {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));

  // Atomic upsert to prevent race conditions
  const rec = await prisma.rateLimit.upsert({
    where: { name_key_bucket: { name, key, bucket } },
    update: { count: { increment: 1 } },
    create: { name, key, bucket, count: 1 },
    select: { count: true }
  });

  const allowed = rec.count <= limit * burst;
  const reset = (bucket + 1) * windowSec * 1000; // Next bucket start time

  return {
    ok: allowed,
    limit,
    remaining: Math.max(0, limit * burst - rec.count),
    reset
  };
}

/**
 * Generate standard rate limit headers including Retry-After
 *
 * @param rl - Rate limit result from rateLimit()
 * @returns Headers object with X-RateLimit-* and Retry-After
 */
export function rlHeaders(rl: RL) {
  const secs = Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000));
  return {
    'X-RateLimit-Limit': String(rl.limit),
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(Math.floor(rl.reset / 1000)),
    'Retry-After': String(secs)
  };
}
