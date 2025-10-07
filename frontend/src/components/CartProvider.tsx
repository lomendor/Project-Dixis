'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Cart } from '@/lib/cart/cart';
import * as C from '@/lib/cart/cart';

const Ctx = createContext<{ cart: Cart; refresh: () => void }>({
  cart: { items: [] },
  refresh: () => {}
});

export function useCart() {
  return useContext(Ctx);
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const refresh = () => setCart(C.readCart());

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={{ cart, refresh }}>{children}</Ctx.Provider>;
}
