'use client';

import { useState, useRef, useCallback } from 'react';
import { ScreenReaderOnly, StatusAnnouncer } from '@/components/accessibility/ScreenReaderHelper';
import { useMotionSafeClasses } from '@/hooks/useReducedMotion';
import { useRenderPerformance } from '@/hooks/usePerformance';

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  stock?: number | null;
  onAddToCart: (productId: number, quantity: number) => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  showQuantitySelector?: boolean;
  maxQuantity?: number;
  disabled?: boolean;
}

/**
 * Optimized and accessible Add to Cart button with quantity selection
 * Features: debouncing, loading states, error handling, screen reader support
 */
export default function AddToCartButton({
  productId,
  productName,
  stock,
  onAddToCart,
  className = '',
  size = 'md',
  variant = 'primary',
  showQuantitySelector = false,
  maxQuantity,
  disabled = false,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const motionClasses = useMotionSafeClasses();

  // Track render performance
  useRenderPerformance(`AddToCartButton-${productId}`);

  const isOutOfStock = stock === 0;
  const actualMaxQuantity = maxQuantity || stock || 10;
  const isDisabled = disabled || isOutOfStock || isLoading;

  const handleAddToCart = useCallback(async () => {
    if (isDisabled) return;

    // Clear previous messages
    setError('');
    setSuccess('');

    // Debounce rapid clicks
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);

      try {
        await onAddToCart(productId, quantity);
        setSuccess(`Added ${quantity} ${productName} to cart`);
        
        // Reset quantity after successful addition
        if (showQuantitySelector) {
          setQuantity(1);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 150);
  }, [isDisabled, productId, quantity, productName, onAddToCart, showQuantitySelector]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= actualMaxQuantity) {
      setQuantity(newQuantity);
      setError('');
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: isDisabled 
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    secondary: isDisabled
      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
      : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300 focus:ring-gray-500',
  };

  const buttonId = `add-to-cart-${productId}`;
  const quantityId = `quantity-${productId}`;
  const errorId = `error-${productId}`;
  const successId = `success-${productId}`;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Quantity Selector */}
      {showQuantitySelector && !isOutOfStock && (
        <div className="flex items-center gap-2">
          <label 
            htmlFor={quantityId} 
            className="text-sm font-medium text-gray-700"
          >
            Quantity:
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isDisabled}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <input
              id={quantityId}
              type="number"
              min="1"
              max={actualMaxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 text-center border-0 focus:ring-0 text-sm"
              aria-label={`Quantity for ${productName}`}
              aria-describedby={stock ? `Stock available: ${stock}` : undefined}
            />
            
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= actualMaxQuantity || isDisabled}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {stock && (
            <span className="text-xs text-gray-500">
              ({stock} available)
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        id={buttonId}
        type="button"
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${motionClasses.transition}
          w-full font-medium rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${variant === 'secondary' ? 'border' : ''}
        `}
        aria-describedby={`${error ? errorId : ''} ${success ? successId : ''}`}
        aria-label={
          isOutOfStock 
            ? `${productName} is out of stock`
            : isLoading 
              ? `Adding ${showQuantitySelector ? quantity : '1'} ${productName} to cart`
              : `Add ${showQuantitySelector ? quantity : '1'} ${productName} to cart`
        }
        data-testid="add-to-cart"
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="opacity-25"
              />
              <path 
                fill="currentColor" 
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                className="opacity-75"
              />
            </svg>
            Adding...
            <ScreenReaderOnly>Please wait while we add the item to your cart</ScreenReaderOnly>
          </span>
        ) : isOutOfStock ? (
          <>
            Out of Stock
            <ScreenReaderOnly>{productName} is currently out of stock</ScreenReaderOnly>
          </>
        ) : (
          <>
            Add to Cart
            {showQuantitySelector && quantity > 1 && (
              <ScreenReaderOnly>Add {quantity} items</ScreenReaderOnly>
            )}
          </>
        )}
      </button>

      {/* Status Messages */}
      <StatusAnnouncer
        message={error}
        type="error"
        isVisible={!!error}
      />
      
      <StatusAnnouncer
        message={success}
        type="success"
        isVisible={!!success}
      />

      {/* Hidden error/success regions for screen readers */}
      {error && (
        <div 
          id={errorId} 
          role="alert" 
          aria-live="assertive"
          className="sr-only"
        >
          Error: {error}
        </div>
      )}
      
      {success && (
        <div 
          id={successId} 
          role="status" 
          aria-live="polite"
          className="sr-only"
        >
          Success: {success}
        </div>
      )}
    </div>
  );
}