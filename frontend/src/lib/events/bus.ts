import { prisma } from '@/lib/db/client';
import { sendProducerNewOrderNotification } from '@/lib/email';

export type EventType = 'order.created'|'orderItem.status.changed';

export async function emitEvent(type: EventType, payload: any){
  await prisma.event.create({ data: { type, payload }});
  // Map event → notifications
  if(type==='order.created'){
    const phone = payload?.shipping?.phone || '';
    if(phone){
      await (await import('@/lib/notify/queue')).queueNotification('SMS', phone, 'order_created', { orderId: payload.orderId, items: payload.items?.length||0 });
    }
    // PRODUCER-NOTIFICATIONS-01: Notify producers via email
    await notifyProducersForOrder(payload.orderId);
  }
  if(type==='orderItem.status.changed'){
    const phone = payload?.buyerPhone || '';
    if(phone){
      await (await import('@/lib/notify/queue')).queueNotification('SMS', phone, 'order_status_changed', { orderId: payload.orderId, itemTitle: payload.titleSnap, status: payload.status });
    }
  }
}

/**
 * PRODUCER-NOTIFICATIONS-01: Notify all producers for an order
 * Groups items by producer and sends individual emails
 */
async function notifyProducersForOrder(orderId: string) {
  try {
    // Fetch order with items and producer info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { producer: true }
            }
          }
        }
      }
    });

    if (!order) {
      console.warn(`[PRODUCER-NOTIFY] Order ${orderId} not found`);
      return;
    }

    // Group items by producer
    const producerItems = new Map<string, {
      producer: { id: string; name: string; email: string | null };
      items: Array<{ titleSnap: string | null; qty: number; priceSnap: number | null; price: number }>;
    }>();

    for (const item of order.items) {
      const producer = item.product?.producer;
      if (!producer) {
        console.warn(`[PRODUCER-NOTIFY] Item ${item.id} has no producer`);
        continue;
      }

      if (!producer.email) {
        console.warn(`[PRODUCER-NOTIFY] Producer ${producer.name} has no email`);
        continue;
      }

      if (!producerItems.has(producer.id)) {
        producerItems.set(producer.id, {
          producer: { id: producer.id, name: producer.name, email: producer.email },
          items: []
        });
      }
      producerItems.get(producer.id)!.items.push({
        titleSnap: item.titleSnap,
        qty: item.qty,
        priceSnap: item.priceSnap,
        price: item.price
      });
    }

    // Format shipping address
    const shippingAddress = formatShippingAddress(order);
    const customerName = order.name || order.buyerName || 'Πελάτης';

    // Send email to each producer
    for (const [producerId, { producer, items }] of producerItems) {
      const totalForProducer = items.reduce((sum, i) => {
        const price = i.priceSnap ?? i.price;
        return sum + price * i.qty;
      }, 0);

      const result = await sendProducerNewOrderNotification({
        toEmail: producer.email!,
        data: {
          orderId: order.id,
          producerId: producer.id,
          producerName: producer.name,
          items: items.map(i => ({
            titleSnap: i.titleSnap || 'Προϊόν',
            qty: i.qty,
            priceSnap: i.priceSnap ?? i.price
          })),
          customerName,
          shippingAddress,
          totalForProducer
        }
      });

      if (result.ok) {
        console.log(`[PRODUCER-NOTIFY] Sent notification to ${producer.name} (${producer.email}) for order ${orderId}`);
      } else {
        console.error(`[PRODUCER-NOTIFY] Failed to notify ${producer.name}: ${result.error}`);
      }
    }

    console.log(`[PRODUCER-NOTIFY] Notified ${producerItems.size} producer(s) for order ${orderId}`);
  } catch (error) {
    // Don't throw - producer notification failure shouldn't fail the order
    console.error(`[PRODUCER-NOTIFY] Error notifying producers for order ${orderId}:`, error);
  }
}

/**
 * Format order shipping address for display
 */
function formatShippingAddress(order: {
  address?: string | null;
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  city?: string | null;
  shippingCity?: string | null;
  zip?: string | null;
  shippingPostal?: string | null;
}): string {
  const parts: string[] = [];

  const line1 = order.address || order.shippingLine1;
  if (line1) parts.push(line1);

  if (order.shippingLine2) parts.push(order.shippingLine2);

  const city = order.city || order.shippingCity;
  const postal = order.zip || order.shippingPostal;

  if (city && postal) {
    parts.push(`${city} ${postal}`);
  } else if (city) {
    parts.push(city);
  } else if (postal) {
    parts.push(postal);
  }

  return parts.join('\n') || 'Μη διαθέσιμη διεύθυνση';
}
