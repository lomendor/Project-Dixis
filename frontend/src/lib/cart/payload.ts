'use client';
type CartItem={ productId:string; qty:number };
export function readCartItems():CartItem[]{
  try{
    const s = JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}');
    const items = Array.isArray(s.items) ? s.items : [];
    return items.map((i:any)=>({ productId:String(i.productId||''), qty: Math.max(1, Number(i.qty||1)) }))
                .filter((x:CartItem)=>x.productId);
  }catch{ return []; }
}
export function clearCart(){
  try{ localStorage.setItem('dixis_cart_v1', JSON.stringify({ items:[] })); }catch{}
}
