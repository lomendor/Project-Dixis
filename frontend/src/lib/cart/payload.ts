'use client';

/**
 * @deprecated This localStorage-based cart is DEPRECATED as of AG118.2
 * Use /internal/cart cookie-based API instead.
 * This file is kept for backward compatibility only.
 *
 * New cart system: /internal/cart (cookie-based, server-side)
 * Components: CartBadge, CartIcon (use /internal/cart)
 */

type CartItem={ productId:string; qty:number };

export function readCartItems():CartItem[]{
  // DEPRECATED: use /internal/cart instead
  try{
    const s = JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}');
    const items = Array.isArray(s.items) ? s.items : [];
    return items.map((i:any)=>({ productId:String(i.productId||''), qty: Math.max(1, Number(i.qty||1)) }))
                .filter((x:CartItem)=>x.productId);
  }catch{ return []; }
}

export function clearCart(){
  // DEPRECATED: use DELETE /internal/cart instead
  try{ localStorage.setItem('dixis_cart_v1', JSON.stringify({ items:[] })); }catch{}
}
