export type OrderStatus = 'pending'|'paid'|'shipped'|'cancelled'|'refunded';
export type Order = { id: string; customer: string; total: string; status: OrderStatus };

export type SortKey = 'createdAt'|'total';
export type SortArg = `${''|'-'}${SortKey}`;

export interface ListParams {
  status?: OrderStatus;
  page?: number;       // 1-based
  pageSize?: number;   // 5..100
  sort?: SortArg;      // default: -createdAt
  q?: string;          // searches in id or buyerName
  fromDate?: string;   // ISO date (YYYY-MM-DD)
  toDate?: string;     // ISO date (YYYY-MM-DD)
}

export interface OrdersRepo {
  list(params?: ListParams): Promise<{ items: Order[]; count: number }>;
}
