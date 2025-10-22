import { NextRequest, NextResponse } from 'next/server';

type Order = { id: string; customer: string; total: string; status: 'pending'|'paid'|'shipped'|'cancelled'|'refunded' };

const DEMO: Order[] = [
  { id:'A-2001', customer:'Μαρία',   total:'€42.00',  status:'pending'  },
  { id:'A-2002', customer:'Γιάννης', total:'€99.90',  status:'paid'     },
  { id:'A-2003', customer:'Ελένη',   total:'€12.00',  status:'refunded' },
  { id:'A-2004', customer:'Νίκος',   total:'€59.00',  status:'cancelled'},
  { id:'A-2005', customer:'Άννα',    total:'€19.50',  status:'shipped'  },
  { id:'A-2006', customer:'Κώστας',  total:'€31.70',  status:'pending'  },
];

const ALLOWED = new Set(['pending','paid','shipped','cancelled','refunded']);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const demo = url.searchParams.get('demo') === '1' || process.env.DIXIS_DEMO_API === '1';
  const status = url.searchParams.get('status');

  if (!demo) {
    return NextResponse.json({ error: 'Not implemented (enable demo with ?demo=1)' }, { status: 501 });
  }

  if (status && !ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const data = status ? DEMO.filter(o => o.status === (status as Order['status'])) : DEMO;
  return NextResponse.json({ items: data, count: data.length }, { status: 200 });
}
