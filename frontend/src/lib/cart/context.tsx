'use client';
import React from 'react';
import * as Cart from './store';
export function useForceUpdate(){ const [,setTick]=React.useState(0); return ()=>setTick(t=>t+1); }
export function CartProvider({children}:{children:React.ReactNode}){ const force=useForceUpdate(); React.useEffect(()=>{ force(); },[]); return <CartContext.Provider value={{ force }}>{children}</CartContext.Provider>; }
export const CartContext = React.createContext<{force:()=>void}>({ force: ()=>{} });
export function useCart(){ const {force}=React.useContext(CartContext); return { ...Cart, force }; }
