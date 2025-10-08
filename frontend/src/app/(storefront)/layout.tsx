'use client';
import { useState, useEffect } from 'react';
import { CartProvider } from '@/lib/cart/context';
import Link from 'next/link';

function CartBadge(){
  const [n,setN]=useState(0);
  useEffect(()=>{
    function calc(){ try{ const s=JSON.parse(localStorage.getItem('dixis_cart_v1')||'{"items":[]}'); setN((s.items||[]).reduce((a:number,b:any)=>a+Number(b.qty||0),0)); }catch{ setN(0);} }
    calc(); const t=setInterval(calc, 800); return ()=>clearInterval(t);
  },[]);
  return <Link href="/cart" style={{marginLeft:'auto'}}>🛒 {n}</Link>;
}

export default function Layout({ children }:{ children: React.ReactNode }){
  return <CartProvider><div style={{padding:12,display:'grid',gap:12}}>
    <header style={{display:'flex',gap:12,alignItems:'center'}}>
      <Link href="/">Dixis</Link>
      <Link href="/products">Προϊόντα</Link>
      <CartBadge/>
    </header>
    {children}
  </div></CartProvider>;
}
