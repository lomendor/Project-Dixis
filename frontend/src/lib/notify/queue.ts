import { prisma } from '@/lib/db/client';

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
  return prisma.notification.create({ data: { channel, to, template, payload, status }});
}
