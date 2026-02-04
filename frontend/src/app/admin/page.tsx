export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import Link from 'next/link';

/**
 * Pass FIX-ADMIN-DASHBOARD-418-01: Deterministic date formatter for Server Components.
 * Using toISOString() slice avoids hydration mismatch from locale-dependent formatting.
 */
function formatDateStable(date: Date | string): string {
  const d = new Date(date);
  // Format: YYYY-MM-DD HH:MM (stable across server/client)
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

// Type definitions for dashboard data
interface OrderSummary {
  id: string;
  total: number | null;
}

interface RecentOrder {
  id: string;
  createdAt: Date;
  buyerName: string | null;
  total: number | null;
  status: string | null;
}

interface TopProduct {
  titleSnap: string | null;
  _sum: { qty: number | null };
}

function thr(){ return Number.parseInt(process.env.LOW_STOCK_THRESHOLD||'3') || 3; }
const T7 = 1000*60*60*24*7;
const T30 = 1000*60*60*24*30;

export default async function Page(){
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) {
      // Redirect unauthenticated/unauthorized users to login
      redirect('/auth/admin-login?from=/admin');
    }
    throw e; // Re-throw unexpected errors
  }

  const now = new Date();
  const from7 = new Date(now.getTime() - T7);
  const from30 = new Date(now.getTime() - T30);

  const [orders7, pendingCount, lowStockCount, latest, topItems] = await Promise.all([
    prisma.order.findMany({ where:{ createdAt:{ gte: from7 }}, select:{ id:true, total:true } }),
    prisma.order.count({ where:{ status:'PENDING' } }),
    prisma.product.count({ where:{ stock:{ lte: thr() } } }),
    prisma.order.findMany({
      orderBy:{ createdAt:'desc' },
      take:10,
      select:{ id:true, createdAt:true, buyerName:true, total:true, status:true }
    }),
    prisma.orderItem.groupBy({
      by:['titleSnap'],
      where:{ createdAt:{ gte: from30 } },
      _sum:{ qty:true },
      orderBy:{ _sum:{ qty:'desc' } },
      take:10
    }).catch((): TopProduct[] => [])
  ]);

  const revenue7 = orders7.reduce((s: number, o: OrderSummary) => s + Number(o.total ?? 0), 0);
  const orders7Count = orders7.length;

  const fmtMoney = (n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid',gap:16,padding:16}}>
      <h1>Πίνακας Ελέγχου</h1>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Παραγγελίες (7ημ)</div>
          <div style={{fontSize:28,fontWeight:700}}>{orders7Count}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Έσοδα (7ημ)</div>
          <div style={{fontSize:28,fontWeight:700}}>{fmtMoney(revenue7)}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Pending</div>
          <div style={{fontSize:28,fontWeight:700}}>{pendingCount}</div>
        </div>
        <div style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
          <div style={{opacity:.7}}>Low stock (≤ {thr()})</div>
          <div style={{fontSize:28,fontWeight:700}}>{lowStockCount}</div>
        </div>
      </section>

      <section style={{display:'grid',gap:8}}>
        <h3>Τελευταίες παραγγελίες</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><th>#</th><th>Ημ/νία</th><th>Πελάτης</th><th>Σύνολο</th><th>Status</th></tr></thead>
          <tbody>
            {latest.map((o: RecentOrder)=>(
              <tr key={o.id} style={{borderTop:'1px solid #eee'}}>
                <td><Link href={`/admin/orders/${o.id}`}>#{o.id}</Link></td>
                <td>{formatDateStable(o.createdAt)}</td>
                <td>{o.buyerName||'—'}</td>
                <td>{fmtMoney(Number(o.total||0))}</td>
                <td>{String(o.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{display:'grid',gap:8}}>
        <h3>Top προϊόντα (30ημ)</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><th>Προϊόν</th><th>Τεμάχια</th></tr></thead>
          <tbody>
            {Array.isArray(topItems) && topItems.map((t: TopProduct, i: number)=>(
              <tr key={i} style={{borderTop:'1px solid #eee'}}>
                <td>{String(t.titleSnap||'—')}</td>
                <td>{Number(t._sum?.qty||0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
