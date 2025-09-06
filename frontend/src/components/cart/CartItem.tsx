/**
 * CartItem Component - Individual Cart Item Display & Controls
 * PR-88c-3: Cart UI Wire-up with useCheckout Hook
 * 
 * Extracts cart item rendering logic from existing cart page
 * Wires quantity controls to useCheckout hook methods
 * ~80 LOC target with full implementation
 */

import { formatCurrency } from '@/env';
import type { CartItemProps } from './types';

export function CartItem({ 
  item, 
  onQuantityChange, 
  onRemove, 
  isUpdating = false 
}: CartItemProps) {
  return (
    <div 
      key={item.id} 
      data-testid="cart-item" 
      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">Image</span>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-600">
          By {item.producer_name}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
          data-testid="decrease-quantity"
        >
          -
        </button>
        <span className="w-12 text-center text-sm font-medium" data-testid="quantity-display">
          {isUpdating ? '...' : item.quantity}
        </span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
          data-testid="increase-quantity"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
        data-testid="remove-item"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}