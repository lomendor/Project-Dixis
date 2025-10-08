export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/admin';
import Link from 'next/link';

function parseDate(s?:string){ if(!s) return undefined; const d=new Date(s); return isNaN(+d)?undefined:d; }
const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

export default async function Page({ searchParams }:{ searchParams?:Record<string,string|undefined> }){
  await requireAdmin?.();
  const q = String(searchParams?.q||'').trim();
  const status = String(searchParams?.status||'').trim().toUpperCase();
  const from = parseDate(String(searchParams?.from||''));
  const to = parseDate(String(searchParams?.to||''));
  const page = Math.max(1, Number(searchParams?.page||1));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams?.pageSize||10)));

  const where:any = {};
  if(q) where.id = { contains: q };
  if(status) where.status = status;
  if(from || to) where.createdAt = { gte: from || undefined, lte: to || undefined };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where, orderBy:{ createdAt:'desc' },
      select:{ id:true, status:true, total:true, updatedAt:true },
      skip:(page-1)*pageSize, take:pageSize
    }),
    prisma.order.count({ where })
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main style={{display:'grid',gap:16,padding:16}}>
      <h1>Παραγγελίες</h1>

      <form method="get" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}>
        <input name="q" placeholder="Αναζήτηση με ID" defaultValue={q}/>
        <select name="status" defaultValue={status}>
          <option value="">— Όλα τα status —</option>
          {['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" name="from" defaultValue={searchParams?.from as string||''}/>
        <input type="date" name="to" defaultValue={searchParams?.to as string||''}/>
        <select name="pageSize" defaultValue={String(pageSize)}>
          {[10,20,30,50].map(n=><option key={n} value={n}>{n}/σελίδα</option>)}
        </select>
        <button type="submit">Φίλτρο</button>
        <a href={`/api/admin/orders/export?${new URLSearchParams({ q, status, from:searchParams?.from||'', to:searchParams?.to||'' }).toString()}`} target="_blank" rel="noopener">Λήψη CSV</a>
      </form>

      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th>ID</th><th>Status</th><th>Total</th><th>Updated</th><th></th></tr></thead>
        <tbody>
          {rows.map(o=>(
            <tr key={o.id} style={{borderTop:'1px solid #eee'}}>
              <td>#{o.id}</td>
              <td>{o.status}</td>
              <td>{fmt(Number(o.total||0))}</td>
              <td>{new Date(o.updatedAt as any).toLocaleString('el-GR')}</td>
              <td><Link href={`/admin/orders/${o.id}`}>Άνοιγμα</Link></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} style={{textAlign:'center',padding:24,opacity:.7}}>Καμία παραγγελία</td></tr>}
        </tbody>
      </table>

      <nav style={{display:'flex',gap:8,alignItems:'center',justifyContent:'flex-end'}}>
        <span>Σελίδα {page}/{pages}</span>
        <a href={`?${new URLSearchParams({ ...searchParams as any, page:String(Math.max(1,page-1)), pageSize:String(pageSize) }).toString()}`} aria-disabled={page<=1} style={{opacity:page<=1?.5:1,pointerEvents:page<=1?'none':'auto'}}>« Προηγ.</a>
        <a href={`?${new URLSearchParams({ ...searchParams as any, page:String(Math.min(pages,page+1)), pageSize:String(pageSize) }).toString()}`} aria-disabled={page>=pages} style={{opacity:page>=pages?.5:1,pointerEvents:page>=pages?'none':'auto'}}>Επόμ.»</a>
      </nav>
    </main>
  );
}
