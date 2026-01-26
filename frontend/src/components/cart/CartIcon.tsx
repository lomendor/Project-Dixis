'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart, cartCount } from '@/lib/cart';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

/**
 * CartIcon - Clean, unified cart icon for header
 *
 * Visibility rules (UI-SHELL-HEADER-FOOTER-01):
 * - Guest: visible (guest checkout supported)
 * - Consumer: visible
 * - Admin: visible
 * - Producer: visible (producers can also shop as customers)
 *
 * Fix React #418: Uses mounted pattern to prevent hydration mismatch
 * when Zustand persist loads cart from localStorage on client.
 */
export default function CartIcon({ className = '', isMobile = false }: CartIconProps) {
  const { isGuest, isConsumer, isProducer, isAdmin } = useAuth();
  // Fix React #418: Prevent hydration mismatch by waiting for client mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  // Use Zustand cart for all users (guests and authenticated)
  const items = useCart(state => state.items);
  // Fix React #418: Show 0 items during SSR/hydration, actual count after mount
  const cartItemCount = mounted ? cartCount(items) : 0;

  // Cart is visible for ALL roles (including producers who can shop)

  // Determine testid based on role
  const getTestId = () => {
    if (isMobile) {
      if (isGuest) return 'mobile-nav-cart-guest';
      if (isAdmin) return 'mobile-nav-cart-admin';
      return 'mobile-nav-cart';
    }
    if (isGuest) return 'nav-cart-guest';
    if (isAdmin) return 'nav-cart-admin';
    return 'nav-cart';
  };

  // Unified cart icon for all visible roles
  return (
    <Link
      href="/cart"
      className={`relative flex items-center justify-center p-2 text-neutral-600 hover:text-primary transition-colors rounded-md hover:bg-neutral-50 ${className}`}
      data-testid={getTestId()}
      aria-label={`Καλάθι${cartItemCount > 0 ? ` με ${cartItemCount} προϊόντα` : ''}`}
    >
      {/* Cart SVG Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {/* Badge - only show if items > 0 */}
      {cartItemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full"
          data-testid="cart-item-count"
          aria-label="cart-count"
        >
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
      )}
    </Link>
  );
}
