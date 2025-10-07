'use client';
import { useCart } from '@/lib/cart/context';
export default function Add({ product }:{ product:{ id:string; title:string; price:number } }){
  const { addItem, force } = useCart();
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); addItem({ productId:product.id, title:product.title, price:Number(product.price||0), qty:1 }); force(); alert('Προστέθηκε στο καλάθι'); }}>
      <button type="submit" style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:6}}>Προσθήκη στο καλάθι</button>
    </form>
  );
}
