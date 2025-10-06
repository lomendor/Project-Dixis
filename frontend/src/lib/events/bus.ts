import { prisma } from '@/lib/db/client';

export type EventType = 'order.created'|'orderItem.status.changed';

export async function emitEvent(type: EventType, payload: any){
  await prisma.event.create({ data: { type, payload }});
  // Map event → notifications
  if(type==='order.created'){
    const phone = payload?.shipping?.phone || '';
    if(phone){
      await prisma.notification.create({
        data:{ channel:'SMS', to: phone, template:'order_created', payload:{ orderId: payload.orderId, items: payload.items?.length||0 } }
      });
    }
  }
  if(type==='orderItem.status.changed'){
    const phone = payload?.buyerPhone || '';
    if(phone){
      await prisma.notification.create({
        data:{ channel:'SMS', to: phone, template:'order_status_changed', payload:{ orderId: payload.orderId, itemTitle: payload.titleSnap, status: payload.status } }
      });
    }
  }
}
