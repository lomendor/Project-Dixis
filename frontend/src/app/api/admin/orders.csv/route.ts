import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q')||'').trim();
  const st = (searchParams.get('status')||'').toUpperCase();

  const where:any = {};
  const statuses = ['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'];
  if (st && statuses.includes(st)) where.status = st;
  if (q) where.OR = [
    { id: { contains: q } },
    { customerEmail: { contains: q } },
    { buyerName: { contains: q } },
    { buyerPhone: { contains: q } },
  ];

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id:true, createdAt:true, status:true, buyerName:true, buyerPhone:true, total:true }
  });

  const esc = (v:any) => {
    let s = (v==null ? '' : String(v));
    if (/[",\n]/.test(s)) s = `"${s.replace(/"/g,'""')}"`;
    return s;
  };
  const lines = [
    ['id','createdAt','status','buyerName','buyerPhone','totalEUR'].join(','),
    ...rows.map(r=>[
      esc(r.id),
      esc(new Date(r.createdAt as any).toISOString()),
      esc(String(r.status||'PENDING')),
      esc(r.buyerName||'-'),
      esc(r.buyerPhone||'-'),
      esc(Number(r.total||0).toFixed(2))
    ].join(','))
  ];
  const csv = '\uFEFF' + lines.join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="orders-${new Date().toISOString().slice(0,10)}.csv"`
    }
  });
}
