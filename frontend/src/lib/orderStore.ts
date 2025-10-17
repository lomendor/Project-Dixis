export type OrderCreate = {
  postalCode: string;
  method: string;
  weightGrams: number;
  subtotal: number;
  shippingCost: number;
  codFee?: number | null;
  total: number;
  email?: string | null;
  paymentRef?: string | null;
};

type Order = OrderCreate & {
  id: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
};

const _mem: Order[] = [];

export const memOrders = {
  get(id: string): Order | null {
    return _mem.find((o) => o.id === id) || null;
  },
  create(data: OrderCreate): Order {
    const now = new Date().toISOString();
    const o: Order = {
      id: 'mem_' + Math.random().toString(36).slice(2),
      createdAt: now,
      updatedAt: now,
      paymentStatus: 'PAID',
      ...data,
    };
    _mem.unshift(o);
    if (_mem.length > 200) _mem.pop();
    return o;
  },
  list(): Order[] {
    return _mem.slice();
  },
};
