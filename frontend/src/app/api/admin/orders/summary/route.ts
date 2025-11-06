import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prismaSafe';
import { memOrders } from '../../../../../lib/orderStore';
import { adminEnabled } from '../../../../../lib/adminGuard';
import { parseOrderNo } from '../../../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!adminEnabled()) {
    return new NextResponse('admin disabled', { status: 404 });
  }

  // Parse filters from query string (same as list endpoint, but no pagination)
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const pc = url.searchParams.get('pc') || '';
  const method = url.searchParams.get('method') || '';
  const status = url.searchParams.get('status') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const ordNo = url.searchParams.get('ordNo') || '';

  // Parse Order No for date range + suffix filter
  const parsed = ordNo ? parseOrderNo(ordNo) : null;
  const matchSuffix = (id: string) => {
    if (!parsed) return true;
    const safeId = (id || '').replace(/[^a-z0-9]/gi, '');
    return safeId.slice(-4).toUpperCase() === parsed.suffix;
  };

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
      if (parsed) {
        where.createdAt = { ...where.createdAt, gte: parsed.dateStart, lt: parsed.dateEnd };
      }

      // Fetch orders with id and total for aggregation
      let list = await prisma.checkoutOrder.findMany({
        where,
        select: { id: true, total: true },
        take: 1000, // cap for safety
      });

      // Apply suffix filter if ordNo provided
      if (parsed) {
        list = list.filter((o: any) => matchSuffix(o.id));
      }

      const totalCount = list.length;
      const totalAmount = list.reduce((acc: number, o: any) => acc + Number(o.total ?? 0), 0);

      return NextResponse.json({ totalCount, totalAmount });
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
  if (parsed) {
    memList = memList.filter((o) => {
      const oDate = new Date(o.createdAt);
      return oDate >= parsed.dateStart && oDate < parsed.dateEnd && matchSuffix(o.id);
    });
  }

  // Apply take limit for safety
  const limited = memList.slice(0, 1000);

  const totalCount = limited.length;
  const totalAmount = limited.reduce((acc, o: any) => acc + Number(o.total ?? 0), 0);

  return NextResponse.json({ totalCount, totalAmount });
}
