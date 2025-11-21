"use client";
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type Item = { id: string|number; title: string; price: string; imageUrl?: string; qty: number };
type CartCtx = {
  items: Item[];
  count: number;
  add: (i: Omit<Item,"qty">, qty?: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "dixis_cart_v1";

function parsePriceToCents(p: string): number {
  // tries "10,90€", "10.90€", "€10.90"
  const n = (p || "").replace(/[^\d,.\-]/g,"").replace(",",".");
  const v = Number.parseFloat(n);
  return Number.isFinite(v) ? Math.round(v*100) : 0;
}

export function CartProvider({children}:{children: React.ReactNode}) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(()=>{ try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setItems(JSON.parse(raw));
  } catch {} }, []);

  useEffect(()=>{ try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {} },[items]);

  const add = (i: Omit<Item,"qty">, qty=1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => String(p.id)===String(i.id));
      if (idx>=0) {
        const cp = [...prev]; cp[idx] = {...cp[idx], qty: cp[idx].qty + qty}; return cp;
      }
      return [...prev, {...i, qty}];
    });
  };

  const clear = () => setItems([]);

  const count = useMemo(()=>items.reduce((s,i)=>s+i.qty,0),[items]);

  const value = useMemo<CartCtx>(()=>({items, count, add, clear}),[items, count]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(){
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within <CartProvider>");
  return v;
}
