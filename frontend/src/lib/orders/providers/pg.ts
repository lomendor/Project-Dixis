import type { OrdersRepo, OrderStatus } from './types';
class NotImplemented extends Error { constructor(){ super('PG provider not implemented'); this.name='NOT_IMPLEMENTED'; } }
// Πραγματική υλοποίηση στο AG75 (Prisma/Postgres)
export const pgRepo: OrdersRepo = {
  async list(_params?: { status?: OrderStatus }) { throw new NotImplemented(); }
};
