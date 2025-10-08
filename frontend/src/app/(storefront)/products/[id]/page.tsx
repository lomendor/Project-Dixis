import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import Add from './ui/Add';

export const dynamic = 'force-dynamic';

export default async function Page({ params }:{ params:{ id:string } }){
  const p = await prisma.product.findUnique({ where:{ id: String(params.id||'') }, select:{ id:true, title:true, price:true, unit:true, stock:true, isActive:true, imageUrl:true, description:true } });
  if(!p || !p.isActive) return notFound();
  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:960}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(260px,360px) 1fr',gap:16}}>
        <div style={{background:'#fafafa',minHeight:260,display:'grid',placeItems:'center',overflow:'hidden',borderRadius:8}}>
          {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/> : <span style={{opacity:.4,fontSize:'2rem'}}>—</span>}
        </div>
        <div style={{display:'grid',gap:8,alignContent:'start'}}>
          <h1 style={{margin:0}}>{p.title}</h1>
          <div style={{fontSize:'1.25rem',fontWeight:600}}>{fmt(Number(p.price||0))} / {p.unit}</div>
          <div style={{opacity:.7}}>Διαθέσιμο: {Number(p.stock||0)}</div>
          {p.description && <p style={{marginTop:8,whiteSpace:'pre-wrap',lineHeight:1.6}}>{p.description}</p>}
          <div style={{marginTop:12}}><Add product={p}/></div>
        </div>
      </div>
    </main>
  );
}
