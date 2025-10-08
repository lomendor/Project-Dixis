import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Simple session check - presence of dixis_session cookie
  const cookie = req.headers.get('cookie') || '';
  if (!cookie.includes('dixis_session=')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const items = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        buyerName: true,
        buyerPhone: true,
        buyerEmail: true
      }
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
