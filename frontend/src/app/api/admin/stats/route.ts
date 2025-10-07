import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

type Day = { date: string; orders: number; revenue: number };

function startOfDay(d: Date){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function iso(d: Date){ return startOfDay(d).toISOString().slice(0,10); }

export async function GET(req: Request){
  try{
    const now = new Date();
    const from = new Date(); from.setDate(from.getDate()-30);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from } },
      include: { items: { select: { qty:true, price:true, titleSnap:true, productId:true } } },
      orderBy: { createdAt: 'desc' }
    });

    const allTotal = orders.reduce((s,o)=> s + Number(o.total ?? o.items.reduce((a,i)=> a + Number(i.price||0)*Number(i.qty||0),0)), 0);

    const statusKeys = ['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'] as const;
    const statusCounts: Record<string, number> = Object.fromEntries(statusKeys.map(k=>[k,0]));
    for(const o of orders){ const k = String(o.status||'PENDING').toUpperCase(); if(statusCounts[k]!=null) statusCounts[k]++; }

    const dayMap = new Map<string, Day>();
    for(let i=13;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); dayMap.set(iso(d), { date: iso(d), orders:0, revenue:0 }); }
    let ordersToday = 0;
    for(const o of orders){
      const key = iso(new Date(o.createdAt as any));
      const rev = Number(o.total ?? o.items.reduce((a,i)=> a + Number(i.price||0)*Number(i.qty||0),0));
      if(dayMap.has(key)){ const d = dayMap.get(key)!; d.orders += 1; d.revenue += rev; }
      if(key === iso(now)) ordersToday += 1;
    }

    const prod = new Map<string, { title: string; qty: number; revenue: number }>();
    for(const o of orders){
      for(const it of o.items){
        const id = String((it as any).productId||it.titleSnap||'unknown');
        const row = prod.get(id) || { title: it.titleSnap || '—', qty: 0, revenue: 0 };
        row.qty += Number(it.qty||0);
        row.revenue += Number(it.price||0)*Number(it.qty||0);
        prod.set(id, row);
      }
    }
    const topProducts = Array.from(prod.entries())
      .map(([id,v])=>({ id, title:v.title, qty:v.qty, revenue:v.revenue }))
      .sort((a,b)=> b.qty - a.qty)
      .slice(0,10);

    const totalOrders = orders.length;
    const avgOrder = totalOrders ? allTotal/totalOrders : 0;

    return NextResponse.json({
      kpis: {
        totalOrders,
        revenueTotal: Number(allTotal.toFixed(2)),
        avgOrder: Number(avgOrder.toFixed(2)),
        ordersToday
      },
      status: statusCounts,
      last14d: Array.from(dayMap.values()).map(d=>({ ...d, revenue: Number(d.revenue.toFixed(2))})),
      topProducts: topProducts.map(t=>({ ...t, revenue: Number(t.revenue.toFixed(2)) }))
    });
  }catch(e:any){
    return NextResponse.json({ error: e?.message || 'stats_failed' }, { status: 500 });
  }
}
