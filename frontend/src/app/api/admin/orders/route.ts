import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdminOr401 } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  // Admin guard - require authentication
  const unauthorized = await requireAdminOr401(req);
  if (unauthorized) return unauthorized;
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const status = url.searchParams.get('status') || undefined;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status.toUpperCase();
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  if (q) {
    where.OR = [
      { id: { contains: q } },
      { buyerPhone: { contains: q } }
    ];
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        buyerName: true,
        buyerPhone: true,
        status: true,
        total: true
      }
    })
  ]);

  return NextResponse.json({ page, limit, total, items });
}
