import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { memOrders } from '../../../../../lib/orderStore';
import { adminEnabled } from '../../../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
): Promise<NextResponse> {
  if (!adminEnabled()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const id = ctx?.params?.id;
  if (!id) {
    return new NextResponse('missing id', { status: 400 });
  }

  try {
    const o = await prisma.checkoutOrder.findUnique({ where: { id } });
    if (!o) {
      return new NextResponse('not found', { status: 404 });
    }
    return NextResponse.json(o);
  } catch {
    // fallthrough to memory
  }
  const m = memOrders.get(id);
  if (!m) {
    return new NextResponse('not found', { status: 404 });
  }
  return NextResponse.json(m);
}
