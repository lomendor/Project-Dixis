import type { OrdersRepo, Order, ListParams } from './types';
import { parseSort, clamp } from './_map';

const DEMO: Order[] = [
  { id:'A-2001', customer:'Μαρία',   total:'€42.00',  status:'pending'  },
  { id:'A-2002', customer:'Γιάννης', total:'€99.90',  status:'paid'     },
  { id:'A-2003', customer:'Ελένη',   total:'€12.00',  status:'refunded' },
  { id:'A-2004', customer:'Νίκος',   total:'€59.00',  status:'cancelled'},
  { id:'A-2005', customer:'Άννα',    total:'€19.50',  status:'shipped'  },
  { id:'A-2006', customer:'Κώστας',  total:'€31.70',  status:'pending'  },
];

export const demoRepo: OrdersRepo = {
  async list(params?: ListParams) {
    let arr = DEMO;
    if (params?.status) arr = arr.filter(o=>o.status===params.status);

    const { key, desc } = parseSort(params?.sort);
    arr = [...arr].sort((a,b)=>{
      let aVal: any = key === 'total' ? parseFloat(a.total.replace(/[^\d.]/g,'')) : a.id;
      let bVal: any = key === 'total' ? parseFloat(b.total.replace(/[^\d.]/g,'')) : b.id;
      return desc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });

    const pageSize = clamp(params?.pageSize ?? 10, 5, 100);
    const page = Math.max(params?.page ?? 1, 1);
    const skip = (page - 1) * pageSize;
    const items = arr.slice(skip, skip + pageSize);

    return { items, count: arr.length };
  }
};
