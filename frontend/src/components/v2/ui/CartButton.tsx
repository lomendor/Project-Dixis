'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ScreenReaderOnly } from '@/components/accessibility/ScreenReaderHelper';
import { useMotionSafeClasses } from '@/hooks/useReducedMotion';
import { useRenderPerformance } from '@/hooks/usePerformance';

interface CartButtonProps {
  itemCount?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showCount?: boolean;
  animate?: boolean;
}

/**
 * Optimized and accessible cart button with item count indicator
 * Features: animation control, proper ARIA labels, keyboard support
 */
export default function CartButton({
  itemCount = 0,
  href = '/cart',
  onClick,
  className = '',
  size = 'md',
  showLabel = true,
  showCount = true,
  animate = true,
}: CartButtonProps) {
  const [previousCount, setPreviousCount] = useState(itemCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const motionClasses = useMotionSafeClasses();

  // Track render performance
  useRenderPerformance('CartButton');

  // Animate when item count increases
  useEffect(() => {
    if (animate && itemCount > previousCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPreviousCount(itemCount);
  }, [itemCount, previousCount, animate]);

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-2.5 text-base',
    lg: 'p-3 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const badgeSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5',
    md: 'text-xs px-2 py-1 min-w-[1.5rem] h-6',
    lg: 'text-sm px-2 py-1 min-w-[1.75rem] h-7',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }
  };

  const cartLabel = itemCount === 0 
    ? 'Shopping cart is empty'
    : itemCount === 1 
      ? 'Shopping cart with 1 item'
      : `Shopping cart with ${itemCount} items`;

  const buttonContent = (
    <>
      <div className="relative">
        {/* Cart Icon */}
        <svg
          className={`${iconSizeClasses[size]} ${motionClasses.transition}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 1.68M7 13h10m-10 0l1.68-1.68M5.32 5L5.4 5M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6"
          />
        </svg>

        {/* Item Count Badge */}
        {showCount && itemCount > 0 && (
          <span
            className={`
              absolute -top-2 -right-2 
              ${badgeSizeClasses[size]}
              bg-red-500 text-white 
              rounded-full 
              flex items-center justify-center
              font-medium leading-none
              ${motionClasses.transition}
              ${isAnimating && animate ? 'animate-bounce' : ''}
            `}
            aria-hidden="true"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}

        {/* Animation pulse effect */}
        {isAnimating && animate && (
          <span className="absolute -top-2 -right-2 h-6 w-6 animate-ping bg-red-400 rounded-full opacity-75" />
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="ml-2 font-medium">
          Cart
          <ScreenReaderOnly>
            {itemCount > 0 ? ` (${itemCount} items)` : ' (empty)'}
          </ScreenReaderOnly>
        </span>
      )}

      {/* Screen reader only content */}
      <ScreenReaderOnly>{cartLabel}</ScreenReaderOnly>
    </>
  );

  const baseClasses = `
    ${sizeClasses[size]}
    ${motionClasses.transition}
    inline-flex items-center justify-center
    text-gray-700 hover:text-green-600 
    hover:bg-gray-50 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
    ${className}
  `;

  // Render as Link or Button based on props
  if (href && !onClick) {
    return (
      <Link
        href={href}
        className={baseClasses}
        aria-label={cartLabel}
        data-testid="cart-button"
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={baseClasses}
      aria-label={cartLabel}
      data-testid="cart-button"
    >
      {buttonContent}
    </button>
  );
}

/**
 * Mini cart button for mobile navigation
 */
export function MiniCartButton({
  itemCount = 0,
  onClick,
}: {
  itemCount?: number;
  onClick?: () => void;
}) {
  return (
    <CartButton
      itemCount={itemCount}
      onClick={onClick}
      size="sm"
      showLabel={false}
      className="relative"
    />
  );
}

/**
 * Floating cart button for mobile experience
 */
export function FloatingCartButton({
  itemCount = 0,
  href = '/cart',
  show = true,
}: {
  itemCount?: number;
  href?: string;
  show?: boolean;
}) {
  const motionClasses = useMotionSafeClasses();

  if (!show || itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <CartButton
        itemCount={itemCount}
        href={href}
        size="lg"
        showLabel={false}
        className={`
          bg-green-600 text-white shadow-lg
          hover:bg-green-700 hover:text-white
          ${motionClasses.transition}
          ${motionClasses.hover}
        `}
      />
    </div>
  );
}