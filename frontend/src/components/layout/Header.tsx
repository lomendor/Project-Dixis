'use client';
import Link from 'next/link';
import { useCart } from '@/store/cart';

function CartCount(){ const { count } = useCart(); return <span className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-neutral-900 text-white text-[11px] px-1">{count}</span>; }

export default function Header(){
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-xl">Dixis</Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/products" className="hover:underline">Προϊόντα</Link>
          <Link href="/orders/lookup" className="hover:underline">Παραγγελία</Link>
          <Link href="/producers" className="hover:underline">Για Παραγωγούς</Link>
          <Link href="/legal/terms" className="hover:underline">Όροι</Link>
        </nav>
        <a href="/cart" className="text-sm relative" aria-label="Καλάθι">
          Καλάθι
          <CartCount />
        </a>
      </div>
    </header>
  );
}
