export type OrderStatus = 'pending'|'paid'|'shipped'|'cancelled'|'refunded';
export type Order = { id: string; customer: string; total: string; status: OrderStatus };
export interface OrdersRepo {
  list(params?: { status?: OrderStatus }): Promise<{ items: Order[]; count: number }>;
}
