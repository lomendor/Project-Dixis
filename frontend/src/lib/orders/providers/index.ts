import type { OrdersRepo, OrderStatus, SortArg } from './types';
import { demoRepo } from './demo';
import { sqliteRepo } from './sqlite';
import { pgRepo } from './pg';

export function getOrdersRepo(mode?: string): OrdersRepo {
  switch ((mode || '').toLowerCase()) {
    case 'pg': return pgRepo;
    case 'sqlite': return sqliteRepo;
    case 'demo':
    default: return demoRepo;
  }
}
export type { OrdersRepo, OrderStatus, SortArg };
