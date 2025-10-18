import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prismaSafe';
import { memOrders } from '../../../../../lib/orderStore';
import { adminEnabled } from '../../../../../lib/adminGuard';
import { orderNumber, parseOrderNo } from '../../../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

function escapeCSV(val: any): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// AG37: Helper for safe filename parts
function safePart(x: string): string {
  return String(x || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 60);
}

export async function GET(req: Request) {
  if (!adminEnabled()) {
    return new NextResponse('admin disabled', { status: 404 });
  }

  // Parse filters from query string (same as list endpoint)
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const pc = url.searchParams.get('pc') || '';
  const method = url.searchParams.get('method') || '';
  const status = url.searchParams.get('status') || '';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const ordNo = url.searchParams.get('ordNo') || '';
  const takeParam = url.searchParams.get('take');
  const take = takeParam ? Math.min(Number(takeParam), 1000) : 1000;

  // Parse Order No for date range + suffix filter
  const parsed = ordNo ? parseOrderNo(ordNo) : null;
  const matchSuffix = (id: string) => {
    if (!parsed) return true;
    const safeId = (id || '').replace(/[^a-z0-9]/gi, '');
    return safeId.slice(-4).toUpperCase() === parsed.suffix;
  };

  let rows: any[] = [];

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
        orderBy: { createdAt: 'desc' },
        take,
      });

      // Apply suffix filter if ordNo provided
      if (parsed) {
        list = list.filter((o) => matchSuffix(o.id));
      }

      rows = list.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        postalCode: o.postalCode,
        method: o.method,
        weightGrams: (o as any).weightGrams,
        subtotal: (o as any).subtotal,
        shippingCost: (o as any).shippingCost,
        codFee: (o as any).codFee,
        total: o.total,
        email: (o as any).email,
        paymentStatus: o.paymentStatus,
        paymentRef: (o as any).paymentRef,
      }));
    } catch {
      // Fallthrough to memory
    }
  }

  if (rows.length === 0) {
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

    rows = memList.slice(0, take);
  }

  // Generate CSV
  const header =
    'Order No,Order ID,Created At,Postal Code,Method,Weight (g),Subtotal,Shipping Cost,COD Fee,Total,Email,Payment Status,Payment Ref\n';

  const lines = rows.map((r) => {
    return [
      escapeCSV(orderNumber(r.id, r.createdAt)),
      escapeCSV(r.id),
      escapeCSV(r.createdAt),
      escapeCSV(r.postalCode),
      escapeCSV(r.method),
      escapeCSV(r.weightGrams),
      escapeCSV(r.subtotal),
      escapeCSV(r.shippingCost),
      escapeCSV(r.codFee),
      escapeCSV(r.total),
      escapeCSV(r.email),
      escapeCSV(r.paymentStatus),
      escapeCSV(r.paymentRef),
    ].join(',');
  });

  const csv = header + lines.join('\n');

  // AG37: Build smart filename based on filters
  const parts: string[] = ['orders'];
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Date range or ordNo suffix
  if (ordNo && parsed) {
    const suffix = parsed.suffix.toLowerCase();
    parts.push(today, `ord-${suffix}`);
  } else if (from || to) {
    const fromPart = from ? safePart(from.slice(0, 10)) : '';
    const toPart = to ? safePart(to.slice(0, 10)) : '';
    if (fromPart && toPart && fromPart === toPart) {
      parts.push(fromPart);
    } else {
      if (fromPart) parts.push(`from-${fromPart}`);
      if (toPart) parts.push(`to-${toPart}`);
    }
  } else {
    parts.push(today);
  }

  // Other filters
  if (method) parts.push(safePart(method));
  if (status) parts.push(safePart(status));
  if (q) parts.push(`q-${safePart(q)}`);
  if (pc) parts.push(`pc-${safePart(pc)}`);

  const filename = parts.join('_') + '.csv';

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
