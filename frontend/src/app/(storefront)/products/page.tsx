import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Προϊόντα | Dixis' };

export default async function Page({ searchParams }:{ searchParams?:{ q?:string } }){
  const q = (searchParams?.q||'').trim();
  const where:any = { isActive:true };
  if (q) where.title = { contains: q };
  const items = await prisma.product.findMany({ where, orderBy:{ createdAt:'desc' }, select:{ id:true, title:true, price:true, unit:true, stock:true } });
  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid',gap:12,padding:16}}>
      <h1>Προϊόντα</h1>
      <form><input name="q" placeholder="Αναζήτηση…" defaultValue={q}/> <button type="submit">Αναζήτηση</button></form>
      <ul style={{display:'grid',gap:8, listStyle:'none', padding:0}}>
        {items.map(p=>(
          <li key={p.id} style={{border:'1px solid #eee',borderRadius:8,padding:12}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
              <div>
                <Link href={`/products/${p.id}`}><b>{p.title}</b></Link>
                <div>{fmt(Number(p.price||0))} / {p.unit}</div>
                <div style={{opacity:.7}}>Απόθεμα: {Number(p.stock||0)}</div>
              </div>
              <a href={`/products/${p.id}`} style={{padding:'6px 10px',border:'1px solid #ddd',borderRadius:6}}>Προβολή</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
