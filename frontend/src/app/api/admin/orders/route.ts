import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prismaSafe';
import { memOrders } from '../../../../lib/orderStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.BASIC_AUTH !== '1') {
    return new NextResponse('admin disabled', { status: 404 });
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const list = await prisma.checkoutOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json(
        list.map((o) => ({
          id: o.id,
          createdAt: o.createdAt,
          postalCode: o.postalCode,
          method: o.method,
          total: o.total,
          paymentStatus: o.paymentStatus,
        }))
      );
    } catch {
      // Fallthrough to memory
    }
  }
  return NextResponse.json(memOrders.list());
}
