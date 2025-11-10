'use client';
import { useEffect, useState } from 'react';

export default function CartBadge() {
  const [n, setN] = useState(0);

  const load = async () => {
    try {
      const r = await fetch('/api/cart', { cache: 'no-store' });
      const j = await r.json();
      setN(Number(j?.totalItems || 0));
    } catch {
      setN(0);
    }
  };

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('cart:updated', h);
    return () => window.removeEventListener('cart:updated', h);
  }, []);

  return (
    <a href="/cart" aria-label={`Καλάθι (${n})`}>
      🛒 {n}
    </a>
  );
}
