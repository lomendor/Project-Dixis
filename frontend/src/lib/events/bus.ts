import { prisma } from '@/lib/db/client';

export type EventType = 'order.created'|'orderItem.status.changed';

export async function emitEvent(type: EventType, payload: any){
  await prisma.event.create({ data: { type, payload }});
  // Map event → notifications
  if(type==='order.created'){
    const phone = payload?.shipping?.phone || '';
    if(phone){
      await (await import('@/lib/notify/queue')).queueNotification('SMS', phone, 'order_created', { orderId: payload.orderId, items: payload.items?.length||0 });
    }
  }
  if(type==='orderItem.status.changed'){
    const phone = payload?.buyerPhone || '';
    if(phone){
      await (await import('@/lib/notify/queue')).queueNotification('SMS', phone, 'order_status_changed', { orderId: payload.orderId, itemTitle: payload.titleSnap, status: payload.status });
    }
  }
}
