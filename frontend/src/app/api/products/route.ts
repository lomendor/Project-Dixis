import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '12', 10)));
  const q = (url.searchParams.get('q') ?? '').trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } as any },
          { title: { contains: q, mode: 'insensitive' } as any },
          { slug: { contains: q, mode: 'insensitive' } as any },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' as any },
      include: { producer: { select: { name: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  // Ομαλοποίηση πεδίων: name || title, default currency 'EUR'
  const items = rows.map((p: any) => ({
    id: p.id,
    slug: p.slug ?? p.id,
    name: p.name ?? p.title ?? p.slug ?? p.id,
    price: Number(p.price ?? 0),
    currency: p.currency ?? 'EUR',
    producer: p.producer ? { name: p.producer.name } : null,
  }));

  return NextResponse.json({ items, total, page, pageSize });
}
