'use client';

/**
 * @deprecated This localStorage-based cart is DEPRECATED as of AG118.2
 * Use /api/cart cookie-based API instead.
 * This file is kept for backward compatibility only.
 *
 * New cart system: /api/cart (cookie-based, server-side)
 * Components: CartBadge, CartIcon (use /api/cart)
 */

type CartItem={ productId:string; qty:number };

export function readCartItems():CartItem[]{
  console.warn('[DEPRECATED] readCartItems from payload.ts - use /api/cart instead');
  try{
    const s = JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}');
    const items = Array.isArray(s.items) ? s.items : [];
    return items.map((i:any)=>({ productId:String(i.productId||''), qty: Math.max(1, Number(i.qty||1)) }))
                .filter((x:CartItem)=>x.productId);
  }catch{ return []; }
}

export function clearCart(){
  console.warn('[DEPRECATED] clearCart from payload.ts - use DELETE /api/cart instead');
  try{ localStorage.setItem('dixis_cart_v1', JSON.stringify({ items:[] })); }catch{}
}
