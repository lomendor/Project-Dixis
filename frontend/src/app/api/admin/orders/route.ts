import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prismaSafe';
import { memOrders } from '../../../../lib/orderStore';
import { adminEnabled } from '../../../../lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!adminEnabled()) {
    return new NextResponse('admin disabled', { status: 404 });
  }

  // Parse filters from query string
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const pc = url.searchParams.get('pc') || '';
  const method = url.searchParams.get('method') || '';
  const status = url.searchParams.get('status') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const takeParam = url.searchParams.get('take');
  const take = takeParam ? Math.min(Number(takeParam), 1000) : 50;

  const prisma = getPrisma();
  if (prisma) {
    try {
      // Build Prisma where clause
      const where: any = {};

      if (q) {
        where.OR = [
          { id: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ];
      }
      if (pc) {
        where.postalCode = { contains: pc };
      }
      if (method) {
        where.method = method;
      }
      if (status) {
        where.paymentStatus = status;
      }
      if (from) {
        where.createdAt = { ...where.createdAt, gte: new Date(from) };
      }
      if (to) {
        where.createdAt = { ...where.createdAt, lte: new Date(to) };
      }

      const list = await prisma.checkoutOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
      });
      return NextResponse.json(
        list.map((o) => ({
          id: o.id,
          createdAt: o.createdAt,
          postalCode: o.postalCode,
          method: o.method,
          total: o.total,
          paymentStatus: o.paymentStatus,
          email: (o as any).email,
        }))
      );
    } catch {
      // Fallthrough to memory
    }
  }

  // Apply filters to in-memory fallback
  let memList = memOrders.list();

  if (q) {
    const qLower = q.toLowerCase();
    memList = memList.filter(
      (o) =>
        o.id.toLowerCase().includes(qLower) ||
        (o.email && o.email.toLowerCase().includes(qLower))
    );
  }
  if (pc) {
    memList = memList.filter((o) => o.postalCode.includes(pc));
  }
  if (method) {
    memList = memList.filter((o) => o.method === method);
  }
  if (status) {
    memList = memList.filter((o) => o.paymentStatus === status);
  }
  if (from) {
    const fromDate = new Date(from);
    memList = memList.filter((o) => new Date(o.createdAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    memList = memList.filter((o) => new Date(o.createdAt) <= toDate);
  }

  return NextResponse.json(memList.slice(0, take));
}
