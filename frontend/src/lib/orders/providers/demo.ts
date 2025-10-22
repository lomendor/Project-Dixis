import type { OrdersRepo, Order, OrderStatus } from './types';

const DEMO: Order[] = [
  { id:'A-2001', customer:'Μαρία',   total:'€42.00',  status:'pending'  },
  { id:'A-2002', customer:'Γιάννης', total:'€99.90',  status:'paid'     },
  { id:'A-2003', customer:'Ελένη',   total:'€12.00',  status:'refunded' },
  { id:'A-2004', customer:'Νίκος',   total:'€59.00',  status:'cancelled'},
  { id:'A-2005', customer:'Άννα',    total:'€19.50',  status:'shipped'  },
  { id:'A-2006', customer:'Κώστας',  total:'€31.70',  status:'pending'  },
];

export const demoRepo: OrdersRepo = {
  async list(params?: { status?: OrderStatus }) {
    const items = params?.status ? DEMO.filter(o=>o.status===params.status) : DEMO;
    return { items, count: items.length };
  }
};
