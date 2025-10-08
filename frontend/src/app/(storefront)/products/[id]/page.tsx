export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/client';
import { notFound, redirect } from 'next/navigation';
import { addItem } from '@/lib/cart/cookie';
import Link from 'next/link';

const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

export default async function Page({ params }:{ params:{ id:string } }){
  const p = await prisma.product.findUnique({ where:{ id: String(params.id||'') }, select:{ id:true, title:true, price:true, unit:true, stock:true, imageUrl:true, category:true, isActive:true } });
  if(!p || !p.isActive) return notFound();

  async function addToCart(formData: FormData){
    'use server';
    const qty = Math.max(1, Math.min(99, Number(formData.get('qty')||1)));
    addItem({ productId: p.id, title: p.title, price: Number(p.price||0), qty });
    redirect('/cart');
  }

  const inStock = Number(p.stock||0) > 0;

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:600}}>
      <Link href="/products" style={{textDecoration:'none',color:'#0070f3'}}>&larr; Πίσω στα Προϊόντα</Link>

      {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{width:'100%',maxHeight:400,objectFit:'cover',borderRadius:8}}/>}

      <h1 style={{margin:0}}>{p.title}</h1>
      <div style={{fontSize:24,fontWeight:'bold'}}>{fmt(Number(p.price||0))} / {p.unit}</div>
      <div style={{opacity:.7}}>Κατηγορία: {p.category}</div>
      <div style={{opacity:.7}}>
        {inStock ? `Διαθέσιμο: ${Number(p.stock||0)} ${p.unit}` : 'Μη διαθέσιμο'}
      </div>

      <form action={addToCart} style={{display:'grid',gap:12,marginTop:8}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <label htmlFor="qty">Ποσότητα:</label>
          <input
            type="number"
            id="qty"
            name="qty"
            min="1"
            max="99"
            defaultValue="1"
            disabled={!inStock}
            style={{width:80,padding:'6px 8px',border:'1px solid #ddd',borderRadius:4}}
          />
        </div>
        <button
          type="submit"
          disabled={!inStock}
          style={{
            padding:'12px 24px',
            backgroundColor: inStock ? '#0070f3' : '#ccc',
            color:'white',
            border:'none',
            borderRadius:6,
            fontSize:16,
            fontWeight:'bold',
            cursor: inStock ? 'pointer' : 'not-allowed'
          }}
        >
          {inStock ? 'Προσθήκη στο Καλάθι' : 'Μη Διαθέσιμο'}
        </button>
      </form>
    </main>
  );
}
