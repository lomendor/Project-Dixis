'use client';

import { useEffect, useState } from 'react';
import { getE2EToken, isE2E } from '@/lib/e2e';

type CartItem = { id: number; product_id: number; name?: string; quantity: number; price?: number };
type CartResponse = {
  cart_items?: Array<{
    id: number;
    quantity: number;
    product: { id: number; name: string; price: string };
    subtotal: string;
  }>;
  items?: CartItem[];
};

export default function CartClient() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!isE2E()) { setLoading(false); return; } // If not E2E, don't interfere
      try {
        const token = getE2EToken();
        if (!token) { setItems([]); setLoading(false); return; }
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
        const res = await fetch(`${base}/cart/items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`Cart fetch failed: ${res.status}`);
        const data: CartResponse = await res.json();
        if (!ignore) {
          // Handle Laravel API response structure
          const cartItems = data.cart_items?.map(item => ({
            id: item.id,
            product_id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: parseFloat(item.product.price)
          })) || data.items || [];
          setItems(cartItems);
          setLoading(false);
        }
      } catch (e: any) {
        if (!ignore) { setError(e?.message || 'Cart error'); setItems([]); setLoading(false); }
      }
    }
    // microtask to let AuthContext settle
    Promise.resolve().then(run);
    return () => { ignore = true; };
  }, []);

  if (!isE2E()) return null; // Don't render anything if not E2E

  if (loading) return <div data-testid="loading-spinner" aria-busy="true" />;
  if (error) return <div role="alert" data-testid="cart-error">{error}</div>;
  if (!items || items.length === 0) return <div data-testid="cart-empty">Your cart is empty.</div>;

  return (
    <div data-testid="cart-ready">
      {items.map((it) => (
        <div key={it.id ?? `${it.product_id}-${Math.random()}`} data-testid="cart-item">
          <span data-testid="cart-item-name">{it.name ?? `#${it.product_id}`}</span>
          <span data-testid="cart-item-qty">{it.quantity}</span>
          {typeof it.price !== 'undefined' && <span data-testid="cart-item-price">{it.price}</span>}
        </div>
      ))}
    </div>
  );
}