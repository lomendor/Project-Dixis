'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCartMessage } from '@/lib/auth/helpers';
import { useCart, cartCount } from '@/lib/cart';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

export default function CartIcon({ className = '', isMobile = false }: CartIconProps) {
  const { isGuest, isConsumer, isProducer, isAdmin } = useAuth();

  // Use Zustand cart for all users (guests and authenticated)
  const items = useCart(state => state.items);
  const cartItemCount = cartCount(items);

  // Guest users - show cart link (guest checkout supported)
  if (isGuest) {
    return (
      <Link
        href="/cart"
        className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium relative ${className}`}
        data-testid={isMobile ? "mobile-nav-cart-guest" : "nav-cart-guest"}
        aria-label={`Προβολή καλαθιού με ${cartItemCount} προϊόντα`}
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
        aria-label={`Προβολή καλαθιού με ${cartItemCount} προϊόντα`}
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

  // Admin users - full cart access (same as consumers)
  if (isAdmin) {
    return (
      <Link
        href="/cart"
        className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium relative ${className}`}
        data-testid={isMobile ? "mobile-nav-cart-admin" : "nav-cart-admin"}
        aria-label={`Προβολή καλαθιού με ${cartItemCount} προϊόντα`}
      >
        <span className="flex items-center" data-testid="cart-icon-admin">
          🛒 Cart
          {cartItemCount > 0 && (
            <span
              className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
              data-testid="cart-item-count-admin"
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

  // Fallback - show cart link for safety (defensive programming)
  return (
    <Link
      href="/cart"
      className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium relative ${className}`}
      data-testid={isMobile ? "mobile-nav-cart-fallback" : "nav-cart-fallback"}
      aria-label={`Προβολή καλαθιού με ${cartItemCount} προϊόντα`}
    >
      <span className="flex items-center" data-testid="cart-icon-fallback">
        🛒 Cart
        {cartItemCount > 0 && (
          <span
            className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
            data-testid="cart-item-count-fallback"
            aria-label="cart-count"
          >
            {cartItemCount}
          </span>
        )}
      </span>
    </Link>
  );
}