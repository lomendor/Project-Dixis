import { prisma } from '@/lib/db/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Προϊόντα | Dixis' };

export default async function Page({ searchParams }:{ searchParams?:{ q?:string } }){
  const q = (searchParams?.q||'').trim();
  const where:any = { isActive:true };
  if (q) where.title = { contains: q };
  const items = await prisma.product.findMany({ where, orderBy:{ createdAt:'desc' }, select:{ id:true, title:true, price:true, unit:true, stock:true, imageUrl:true } });
  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid',gap:12,padding:16}}>
      <h1>Προϊόντα</h1>
      <form><input name="q" placeholder="Αναζήτηση…" defaultValue={q}/> <button type="submit">Αναζήτηση</button></form>
      <ul style={{display:'grid',gap:8, listStyle:'none', padding:0}}>
        {items.map(p=>(
          <li key={p.id} style={{border:'1px solid #eee',borderRadius:8,padding:12,display:'grid',gridTemplateColumns:'96px 1fr',gap:12}}>
            <div style={{width:96,height:96,background:'#fafafa',display:'grid',placeItems:'center',overflow:'hidden',borderRadius:6}}>
              {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/> : <span style={{opacity:.4}}>—</span>}
            </div>
            <div style={{display:'grid',gap:4,alignContent:'center'}}>
              <Link href={`/products/${p.id}`}><b>{p.title}</b></Link>
              <div>{fmt(Number(p.price||0))} / {p.unit}</div>
              <div style={{opacity:.7}}>Απόθεμα: {Number(p.stock||0)}</div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
