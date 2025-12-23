'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCartMessage } from '@/lib/auth/helpers';
import { getCart } from '@/lib/cart/store';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

export default function CartIcon({ className = '', isMobile = false }: CartIconProps) {
  const { isGuest, isConsumer, isProducer, user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // Fetch cart count from API (for authenticated users) or localStorage (for guests)
  useEffect(() => {
    // Guest users: get cart from localStorage
    if (isGuest) {
      const updateGuestCart = () => {
        const cart = getCart();
        setCartItemCount(cart.items.length);
      };

      updateGuestCart();

      // Listen for cart updates
      window.addEventListener('storage', updateGuestCart);
      window.addEventListener('cart:updated', updateGuestCart);
      return () => {
        window.removeEventListener('storage', updateGuestCart);
        window.removeEventListener('cart:updated', updateGuestCart);
      };
    }

    // Consumer users: fetch from API
    if (!isConsumer) return undefined;

    async function fetchCartCount() {
      try {
        const res = await fetch('/internal/cart', { cache: 'no-store' });
        const data = await res.json();
        setCartItemCount((data?.items?.length) || 0);
      } catch {
        setCartItemCount(0);
      }
    }

    fetchCartCount();

    // Listen for cart updates
    const handleUpdate = () => fetchCartCount();
    window.addEventListener('cart:updated', handleUpdate);
    return () => window.removeEventListener('cart:updated', handleUpdate);
  }, [isGuest, isConsumer]);

  // Guest users - show cart link (guest checkout supported)
  if (isGuest) {
    return (
      <Link
        href="/cart"
        className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium relative ${className}`}
        data-testid={isMobile ? "mobile-nav-cart-guest" : "nav-cart-guest"}
        aria-label={`View cart with ${cartItemCount} items`}
      >
        <span className="flex items-center" data-testid="cart-icon-guest">
          🛒 Καλάθι
          {cartItemCount > 0 && (
            <span
              className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
              data-testid="cart-item-count-guest"
              aria-label="cart-count"
            >
              {cartItemCount}
            </span>
          )}
        </span>
      </Link>
    );
  }

  // Consumer users - full cart access
  if (isConsumer) {
    return (
      <Link
        href="/cart"
        className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium relative ${className}`}
        data-testid={isMobile ? "mobile-nav-cart" : "nav-cart"}
        aria-label={`View cart with ${cartItemCount} items`}
      >
        <span className="flex items-center" data-testid="cart-icon-active">
          Cart
          {cartItemCount > 0 && (
            <span
              className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
              data-testid="cart-item-count"
              aria-label="cart-count"
            >
              {cartItemCount}
            </span>
          )}
        </span>
      </Link>
    );
  }

  // Producer users - limited cart access with message
  if (isProducer) {
    return (
      <div
        className={`text-gray-500 px-3 py-2 rounded-md text-sm font-medium ${className}`}
        data-testid="cart-producer-mode"
      >
        <span data-testid="cart-producer-message" title="Producers have limited cart access">
          {getCartMessage('producer')}
        </span>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}