import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db/client';
import OrdersTable from '@/components/admin/orders/OrdersTable';
import Filters from '@/components/admin/orders/Filters';

type Status = 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

function parseStatus(v?: string): Status | undefined {
  const s = String(v || '').toUpperCase();
  return (['PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).includes(s as any)
    ? (s as Status)
    : undefined;
}

function parseIntOr(v: any, d: number) {
  const n = parseInt(String(v || ''), 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export default async function Page({ searchParams }: {
  searchParams?: Record<string, string | undefined>;
}) {
  const status = parseStatus(searchParams?.status);
  const q = (searchParams?.q || '').trim();
  const page = parseIntOr(searchParams?.page, 1);
  const perPage = Math.min(100, parseIntOr(searchParams?.perPage, 20));

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { buyerPhone: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        buyerName: true,
        buyerPhone: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div style={{ padding: '16px' }}>
      <h1>Διαχείριση Παραγγελιών</h1>
      <Filters current={{ status, q, page, perPage }} />
      <Suspense fallback={<div>Φόρτωση…</div>}>
        <OrdersTable rows={rows as any[]} total={total} page={page} perPage={perPage} />
      </Suspense>
      <div style={{ marginTop: 12 }}>
        <Link
          href={`/api/admin/orders/export?status=${status || ''}&q=${encodeURIComponent(q)}&page=${page}&perPage=${perPage}`}
          prefetch={false}
          style={{
            padding: '8px 16px',
            background: '#16a34a',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 4,
            display: 'inline-block'
          }}
        >
          Export CSV
        </Link>
      </div>
    </div>
  );
}
