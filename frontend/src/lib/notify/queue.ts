import { prisma } from '@/lib/db/client';
import { notifFingerprint } from '@/lib/notify/fingerprint';

export const CHANNELS = ['SMS','EMAIL'] as const;
export type Channel = typeof CHANNELS[number];
export const STATUSES = ['QUEUED','SENT','FAILED'] as const;
export type Status = typeof STATUSES[number];

export async function queueNotification(
  channel: Channel,
  to: string,
  template: string,
  payload: any,
  status: Status = 'QUEUED'
){
  if(!CHANNELS.includes(channel)) throw new Error('Invalid channel');
  if(!STATUSES.includes(status)) throw new Error('Invalid status');

  // Idempotency: check for duplicate within 10-minute window
  const dedupId = notifFingerprint(channel, to, template, payload);
  const existing = await prisma.notification.findFirst({
    where: {
      status: 'QUEUED',
      dedupId,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }
    }
  });
  if (existing) return existing;

  return prisma.notification.create({ data: { channel, to, template, payload, status, dedupId } });
}
