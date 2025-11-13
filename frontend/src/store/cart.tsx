'use client';
import React from 'react';

export type CartItem = { id: string; title: string; price: number; currency: string; qty: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Omit<CartItem,'qty'>, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};
const Ctx = React.createContext<CartCtx | null>(null);
const KEY = 'dixis:cart:v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  React.useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  React.useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }, [items]);

  const api = React.useMemo<CartCtx>(() => ({
    items,
    count: items.reduce((a,b)=>a+b.qty,0),
    total: items.reduce((a,b)=>a+b.price*b.qty,0),
    add: (p, qty=1) => setItems((cur)=>{
      const id = String(p.id);
      const i = cur.findIndex(x=>x.id===id);
      if (i>=0) { const clone=[...cur]; clone[i]={...clone[i], qty: clone[i].qty + qty}; return clone; }
      return [...cur, { ...p, id, qty }];
    }),
    setQty: (id, qty) => setItems((cur)=>cur.map(x=>x.id===String(id)?{...x, qty: Math.max(1, qty)}:x)),
    remove: (id) => setItems((cur)=>cur.filter(x=>x.id!==String(id))),
    clear: () => setItems([]),
  }), [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export function useCart(){ const v=React.useContext(Ctx); if(!v) throw new Error('useCart outside provider'); return v; }
