import type { OrdersRepo, ListParams } from './types';
import { prisma } from '@/lib/prisma';
import { toDto, parseSort, clamp } from './_map';

export const pgRepo: OrdersRepo = {
  async list(params?: ListParams) {
    const where = params?.status ? { status: params.status } : undefined;
    const { key, desc } = parseSort(params?.sort);
    const orderBy = { [key]: desc ? 'desc' : 'asc' } as any;

    const pageSize = clamp(params?.pageSize ?? 10, 5, 100);
    const page = Math.max(params?.page ?? 1, 1);
    const skip = (page - 1) * pageSize;

    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: { id: true, buyerName: true, total: true, status: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDto), count };
  },
};
