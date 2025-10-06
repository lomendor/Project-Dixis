import { prisma } from '@/lib/db/client';

export type RL = { ok: boolean; limit: number; remaining: number; reset: number };

export async function rateLimit(
  name: string,
  key: string,
  limit: number,
  windowSec: number,
  burst = 1
): Promise<RL> {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));

  const rec = await prisma.rateLimit.upsert({
    where: { name_key_bucket: { name, key, bucket } },
    update: { count: { increment: 1 } },
    create: { name, key, bucket, count: 1 },
    select: { count: true }
  });

  const allowed = rec.count <= limit * burst;
  const reset = (bucket + 1) * windowSec * 1000;

  return {
    ok: allowed,
    limit,
    remaining: Math.max(0, limit * burst - rec.count),
    reset
  };
}

export function rlHeaders(rl: RL) {
  return {
    'X-RateLimit-Limit': String(rl.limit),
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(Math.floor(rl.reset / 1000))
  } as Record<string, string>;
}
