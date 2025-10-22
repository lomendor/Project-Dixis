import type { OrdersRepo, Order, OrderStatus, ListParams } from './types';
import { parseSort, clamp, parseDateRange } from './_map';

const now = Date.now();
const DEMO: (Order & { createdAt: Date; totalNum: number })[] = [
  { id:'A-2001', customer:'Μαρία',   total:'€42.00',  status:'pending',   createdAt:new Date(now-5*864e5), totalNum:42.00 },
  { id:'A-2002', customer:'Γιάννης', total:'€99.90',  status:'paid',      createdAt:new Date(now-4*864e5), totalNum:99.90 },
  { id:'A-2003', customer:'Ελένη',   total:'€12.00',  status:'refunded',  createdAt:new Date(now-3*864e5), totalNum:12.00 },
  { id:'A-2004', customer:'Νίκος',   total:'€59.00',  status:'cancelled', createdAt:new Date(now-2*864e5), totalNum:59.00 },
  { id:'A-2005', customer:'Άννα',    total:'€19.50',  status:'shipped',   createdAt:new Date(now-1*864e5), totalNum:19.50 },
  { id:'A-2006', customer:'Κώστας',  total:'€31.70',  status:'pending',   createdAt:new Date(now-0*864e5), totalNum:31.70 },
];

export const demoRepo: OrdersRepo = {
  async list(params?: ListParams) {
    const p = params || {};
    const page = clamp(Math.floor(p.page || 1), 1, 9999);
    const pageSize = clamp(Math.floor(p.pageSize || 10), 1, 100);
    const { key, dir } = parseSort(p.sort);
    const range = parseDateRange(p);

    let rows = DEMO.slice();
    if (p.status) rows = rows.filter(o=>o.status===p.status);
    if (p.q) {
      const q = p.q.toLowerCase();
      rows = rows.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    }
    if (range.gte) rows = rows.filter(o => o.createdAt >= range.gte!);
    if (range.lte) rows = rows.filter(o => o.createdAt <= range.lte!);

    rows.sort((a,b) => {
      const av = key === 'createdAt' ? a.createdAt.getTime() : a.totalNum;
      const bv = key === 'createdAt' ? b.createdAt.getTime() : b.totalNum;
      return dir==='asc' ? av-bv : bv-av;
    });

    const count = rows.length;
    const start = (page-1)*pageSize;
    const items = rows.slice(start, start+pageSize).map(o => ({ id:o.id, customer:o.customer, total:o.total, status:o.status }));
    return { items, count };
  }
};
