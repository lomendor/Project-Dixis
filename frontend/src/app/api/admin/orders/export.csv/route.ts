import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdminOr401 } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  // Admin guard - require authentication
  const unauthorized = await requireAdminOr401(req);
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || undefined;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;

  const where: any = {};

  if (status) {
    where.status = status.toUpperCase();
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      buyerName: true,
      buyerPhone: true,
      status: true,
      total: true
    }
  });

  const header = ['id', 'createdAt', 'buyerName', 'buyerPhone', 'status', 'total'];
  const csv = [
    header.join(','),
    ...rows.map(r => [
      r.id,
      r.createdAt?.toISOString() || '',
      r.buyerName || '',
      r.buyerPhone || '',
      r.status || '',
      String(r.total ?? '')
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="orders.csv"'
    }
  });
}
