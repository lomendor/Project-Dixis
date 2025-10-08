'use client';
import { useCart } from '@/lib/cart/context';
export default function Add({ product }:{ product:{ id:string; title:string; price:number; stock?:number } }){
  const { addItem, force } = useCart();
  const outOfStock = Number((product as any).stock||0) <= 0;
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); if(outOfStock){ alert('Μη διαθέσιμο'); return; } addItem({ productId:product.id, title:product.title, price:Number(product.price||0), qty:1 }); force(); alert('Προστέθηκε στο καλάθι'); }}>
      <button type="submit" disabled={outOfStock} style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:6,opacity:outOfStock?0.5:1,cursor:outOfStock?'not-allowed':'pointer'}}>Προσθήκη στο καλάθι</button>
    </form>
  );
}
