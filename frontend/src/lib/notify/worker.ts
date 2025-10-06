import { prisma } from '@/lib/db/client';
import { deliverOne } from '@/lib/notify/deliver';

function backoff(attempts: number): Date {
  // Exponential backoff: 1m, 5m, 15m, 1h, 3h, 12h (max)
  const mins = [1, 5, 15, 60, 180, 720][Math.min(attempts, 5)];
  const jitter = Math.floor(Math.random() * Math.min(60, mins * 10)); // seconds jitter
  return new Date(Date.now() + (mins * 60 + jitter) * 1000);
}

const MAX_ATTEMPTS = 6;

export async function deliverDue(limit = 20) {
  const now = new Date();
  const rows = await prisma.notification.findMany({
    where: {
      status: 'QUEUED',
      OR: [
        { attempts: 0 },
        { nextAttemptAt: { lte: now } }
      ]
    },
    orderBy: { createdAt: 'asc' },
    take: limit
  });

  const out: any[] = [];
  for (const r of rows) {
    const res = await deliverOne(r.id);
    if (!res.ok) {
      const attempts = r.attempts + 1;
      const failed = attempts >= MAX_ATTEMPTS;
      await prisma.notification.update({
        where: { id: r.id },
        data: failed
          ? { status: 'FAILED', attempts, error: r.error || 'Max attempts exceeded' }
          : { status: 'QUEUED', attempts, nextAttemptAt: backoff(attempts) }
      });
      out.push({ id: r.id, ok: false, attempts, failed });
    } else {
      await prisma.notification.update({
        where: { id: r.id },
        data: { attempts: r.attempts, nextAttemptAt: null }
      });
      out.push({ id: r.id, ok: true, simulated: !!res.simulated });
    }
  }
  return out;
}
