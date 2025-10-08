import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

function csvEscape(s:string){ return `"${String(s).replace(/"/g,'""')}"`; }

export async function GET(req:Request){
  await requireAdmin?.();
  const url = new URL(req.url);
  const q = String(url.searchParams.get('q')||'').trim();
  const status = String(url.searchParams.get('status')||'').trim().toUpperCase();
  const from = url.searchParams.get('from'); const to = url.searchParams.get('to');
  const where:any = {};
  if(q) where.id = { contains: q };
  if(status) where.status = status;
  if(from || to) where.createdAt = { gte: from? new Date(from):undefined, lte: to? new Date(to):undefined };

  const rows = await prisma.order.findMany({
    where, orderBy:{ createdAt:'desc' },
    select:{ id:true, status:true, total:true, updatedAt:true }
  });

  const header = ['id','status','total','updatedAt'];
  const lines = [header.join(',')].concat(rows.map(r=>[
    csvEscape(r.id), csvEscape(r.status), String(Number(r.total||0)), csvEscape((r.updatedAt as any).toISOString())
  ].join(',')));

  const body = lines.join('\n');
  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="orders.csv"`
    }
  });
}
