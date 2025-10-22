export type OrderStatus = 'pending'|'paid'|'shipped'|'cancelled'|'refunded';
export type Order = { id: string; customer: string; total: string; status: OrderStatus };

export type SortKey = 'createdAt'|'total';
export type SortArg = `${''|'-'}${SortKey}`; // e.g. 'createdAt' or '-createdAt'

export interface ListParams {
  status?: OrderStatus;
  page?: number;       // 1-based
  pageSize?: number;   // 5..100
  sort?: SortArg;      // default: -createdAt
}

export interface OrdersRepo {
  list(params?: ListParams): Promise<{ items: Order[]; count: number }>;
}
