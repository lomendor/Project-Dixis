'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCartMessage } from '@/lib/auth/helpers';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

export default function CartIcon({ className = '', isMobile = false }: CartIconProps) {
  const { isGuest, isConsumer, isProducer, user } = useAuth();
  
  // Mock cart item count (in real app, this would come from cart context)
  const cartItemCount = 3; // TODO: Replace with real cart state

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
        data-testid="cart-icon-active"
        aria-label={`View cart with ${cartItemCount} items`}
      >
        <span className="flex items-center">
          Cart
          {cartItemCount > 0 && (
            <span 
              className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
              data-testid="cart-item-count"
              aria-label={`${cartItemCount} items in cart`}
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