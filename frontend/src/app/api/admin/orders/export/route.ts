import { prisma } from '@/lib/db/client';

type Status = 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

function parseStatus(v?: string): Status | undefined {
  const s = String(v || '').toUpperCase();
  return (['PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).includes(s as any)
    ? (s as Status)
    : undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = parseStatus(url.searchParams.get('status') || undefined);
  const q = (url.searchParams.get('q') || '').trim();

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { buyerPhone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      buyerName: true,
      buyerPhone: true,
      total: true,
      status: true,
    },
  });

  const header = ['id', 'date', 'customerName', 'customerPhone', 'total', 'status'];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;

  const csv = [header.join(',')]
    .concat(
      rows.map((r: any) => {
        const date = new Date(r.createdAt);
        const iso = isNaN(date.getTime()) ? '' : date.toISOString();
        return [
          r.id,
          iso,
          r.buyerName || '',
          r.buyerPhone || '',
          String(Number(r.total || 0)),
          String(r.status || ''),
        ]
          .map(esc)
          .join(',');
      })
    )
    .join('\n');

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="orders.csv"',
      'cache-control': 'no-store',
    },
  });
}
