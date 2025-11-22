'use client';
import { CartProvider } from '@/store/cart';
import Link from 'next/link';
import { CartBadge } from '@/components/CartBadge';

export default function Layout({ children }:{ children: React.ReactNode }){
  return <CartProvider><div style={{padding:12,display:'grid',gap:12}}>
    <header style={{display:'flex',gap:12,alignItems:'center'}}>
      <Link href="/">Dixis</Link>
      <Link href="/products">Προϊόντα</Link>
      <div style={{marginLeft:'auto'}}>
        <CartBadge/>
      </div>
    </header>
    {children}
  </div></CartProvider>;
}
