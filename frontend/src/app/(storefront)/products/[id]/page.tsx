import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import Add from './ui/Add';

export const dynamic = 'force-dynamic';

export default async function Page({ params }:{ params:{ id:string } }){
  const p = await prisma.product.findUnique({ where:{ id: String(params.id||'') }, select:{ id:true, title:true, price:true, unit:true, stock:true, isActive:true } });
  if(!p || !p.isActive) return notFound();
  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid',gap:12,padding:16}}>
      <h1>{p.title}</h1>
      <div>{fmt(Number(p.price||0))} / {p.unit}</div>
      <div style={{opacity:.7}}>Διαθέσιμο: {Number(p.stock||0)}</div>
      <Add product={p}/>
    </main>
  );
}
