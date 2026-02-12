import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { memOrders } from '../../../../../lib/orderStore';
import { requireAdmin, AdminError } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
