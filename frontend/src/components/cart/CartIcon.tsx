'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCartMessage } from '@/lib/auth/helpers';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

export default function CartIcon({ className = '', isMobile = false }: CartIconProps) {
  const { isGuest, isConsumer, isProducer, user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // Fetch cart count from API
  useEffect(() => {
    if (!isConsumer) return undefined;

    async function fetchCartCount() {
      try {
        const res = await fetch('/api/cart', { cache: 'no-store' });
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
  }, [isConsumer]);

  // Guest users - show login prompt
  if (isGuest) {
    return (
      <Link
        href="/auth/login"
        className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium ${className}`}
        data-testid="cart-login-prompt"
        aria-label="Login to access cart"
      >
        {getCartMessage('guest')}
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