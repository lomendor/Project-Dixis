import type { OrdersRepo, OrderStatus } from './types';
import { prisma } from '@/lib/prisma';
import { toDto } from './_map';

export const pgRepo: OrdersRepo = {
  async list(params?: { status?: OrderStatus }) {
    const where = params?.status ? { status: params.status } : undefined;
    const [rows, count] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { id: true, buyerName: true, total: true, status: true },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toDto), count };
  },
};
