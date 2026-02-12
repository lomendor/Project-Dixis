import type { OrdersRepo, ListParams } from './types';
import { prisma } from '@/lib/db/client';
import { toDto, parseSort, clamp, parseDateRange } from './_map';

export const sqliteRepo: OrdersRepo = {
  async list(params?: ListParams) {
    const p = params || {};
    const page = clamp(Math.floor(p.page || 1), 1, 9999);
    const pageSize = clamp(Math.floor(p.pageSize || 10), 1, 100);
    const { key, dir } = parseSort(p.sort);
    const range = parseDateRange(p);

    const where:any = {};
    if (p.status) where.status = p.status;
    if (p.q) {
      where.OR = [
        { id: { contains: p.q } },
        { buyerName: { contains: p.q } },
      ];
    }
    if (range.gte || range.lte) where.createdAt = { ...(range.gte && { gte: range.gte }), ...(range.lte && { lte: range.lte }) };

    const orderBy = key === 'createdAt' ? { createdAt: dir } : { total: dir as 'asc'|'desc' };

    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page-1)*pageSize,
        take: pageSize,
        select: { id:true, buyerName:true, total:true, status:true, createdAt:true },
      }),
      prisma.order.count({ where }),
    ]);

    return { items: rows.map(toDto), count };
  },
};
