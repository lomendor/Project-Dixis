import { prisma } from '@/lib/db/client';

export async function kpisAdmin(now = new Date()){
  const since = new Date(now.getTime() - 7*24*60*60*1000);
  const revenueStatuses = ['PAID','PACKING','SHIPPED','DELIVERED'];

  const [revenueRows, statusCounts, lowStock] = await Promise.all([
    prisma.order.findMany({
      where:{ createdAt:{ gte: since }, status:{ in: revenueStatuses } },
      select:{ total:true },
    }),
    prisma.order.groupBy({
      by:['status'],
      _count:{ _all:true }
    }),
    prisma.product.findMany({
      where:{ isActive:true, stock:{ lte: Number(process.env.LOW_STOCK_THRESHOLD||3) } },
      select:{ id:true, title:true, stock:true },
      orderBy:{ stock:'asc' },
      take:5
    })
  ]);

  const revenue7d = revenueRows.reduce((s,r)=> s + Number(r.total||0), 0);
  const statusMap: Record<string, number> = {};
  for(const sc of statusCounts){ statusMap[sc.status] = (sc as any)._count._all || 0; }

  return { revenue7d, statusMap, lowStock };
}
