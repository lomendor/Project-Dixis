import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prismaSafe';
import { memOrders } from '../../../../lib/orderStore';
import { adminEnabled } from '../../../../lib/adminGuard';
import { parseOrderNo } from '../../../../lib/orderNumber';

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
  const ordNo = url.searchParams.get('ordNo') || '';
  const takeParam = url.searchParams.get('take');
  const take = takeParam ? Math.min(Number(takeParam), 1000) : 50;
  const skipParam = url.searchParams.get('skip');
  const skip = skipParam ? Math.max(0, Number(skipParam)) : 0;
  const countFlag = url.searchParams.get('count') === '1';

  // Sorting parameters
  const rawSort = (url.searchParams.get('sort') || 'createdAt').trim();
  const rawDir = (url.searchParams.get('dir') || 'desc').trim().toLowerCase();
  const sortKey: 'createdAt' | 'total' = ['createdAt', 'total'].includes(rawSort) ? rawSort as any : 'createdAt';
  const sortDir: 'asc' | 'desc' = (rawDir === 'asc' || rawDir === 'desc') ? rawDir : 'desc';

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

      let list = await prisma.checkoutOrder.findMany({
        where,
        orderBy: { [sortKey]: sortDir },
        skip,
        take,
      });

      // Apply suffix filter if ordNo provided
      if (parsed) {
        list = list.filter((o) => matchSuffix(o.id));
      }

      const mapped = list.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        postalCode: o.postalCode,
        method: o.method,
        total: o.total,
        paymentStatus: o.paymentStatus,
        email: (o as any).email,
      }));

      // If count=1, return {items, total}; otherwise return array (backward compatible)
      if (countFlag) {
        const total = await prisma.checkoutOrder.count({ where });
        return NextResponse.json({ items: mapped, total });
      }

      return NextResponse.json(mapped);
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

  // Sort in-memory list
  memList = memList.sort((a: any, b: any) => {
    const av = sortKey === 'total' ? Number(a.total || 0) : new Date(a.createdAt).getTime();
    const bv = sortKey === 'total' ? Number(b.total || 0) : new Date(b.createdAt).getTime();
    const cmp = av === bv ? 0 : (av < bv ? -1 : 1);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalCount = memList.length;
  const paged = memList.slice(skip, skip + take);

  // If count=1, return {items, total}; otherwise return array (backward compatible)
  if (countFlag) {
    return NextResponse.json({ items: paged, total: totalCount });
  }

  return NextResponse.json(paged);
}
