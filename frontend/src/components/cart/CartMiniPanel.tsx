'use client';

import Link from 'next/link';
const ShoppingCartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" /></svg>;
import { formatCurrency } from '@/env';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  producer_name?: string;
}

export interface CartMiniPanelProps {
  items: CartItem[];
  totalAmount: number;
  isLoading?: boolean;
  className?: string;
  onViewCart?: () => void;
}

export default function CartMiniPanel({
  items = [],
  totalAmount = 0,
  isLoading = false,
  className = '',
  onViewCart
}: CartMiniPanelProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = items.length === 0;

  if (isLoading) {
    return (
      <div className={`bg-white border rounded-lg shadow-lg p-4 ${className}`} data-testid="cart-mini-panel">
        <div className="animate-pulse" data-testid="mini-panel-loading">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`bg-white border rounded-lg shadow-lg p-4 ${className}`} data-testid="cart-mini-panel">
        <div className="flex items-center justify-center text-gray-500" data-testid="empty-cart-mini">
          <ShoppingCartIcon />
          <span className="ml-2">Κενό καλάθι</span>
        </div>
        <Link href="/products" className="block mt-2 text-sm text-blue-600 hover:text-blue-800 text-center" data-testid="continue-shopping-link">Συνέχεια αγορών</Link>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg shadow-lg p-4 ${className}`} data-testid="cart-mini-panel">
      <div className="flex items-center justify-between mb-3" data-testid="mini-panel-header">
        <div className="flex items-center">
          <ShoppingCartIcon />
          <span className="ml-2 font-medium text-gray-800" data-testid="cart-items-count">
            {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
          </span>
        </div>
        <span className="font-bold text-lg text-green-600" data-testid="cart-total-amount">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <div className="space-y-2 mb-4" data-testid="mini-items-list">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex justify-between text-sm" data-testid="mini-item">
            <div className="flex-1 truncate">
              <span className="text-gray-800" data-testid="mini-item-name">{item.name}</span>
              {item.producer_name && (
                <span className="text-gray-500 ml-1" data-testid="mini-item-producer">
                  - {item.producer_name}
                </span>
              )}
            </div>
            <div className="ml-2 text-right" data-testid="mini-item-details">
              <span className="text-gray-600" data-testid="mini-item-quantity">
                {item.quantity}x
              </span>
              <span className="ml-1 font-medium" data-testid="mini-item-subtotal">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          </div>
        ))}
        
        {items.length > 3 && (
          <div className="text-xs text-gray-500 text-center" data-testid="more-items-indicator">
            +{items.length - 3} περισσότερα προϊόντα
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Link href="/cart" onClick={onViewCart} className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors" data-testid="cart-view-link">Προβολή καλαθιού</Link>
        <Link href="/checkout" className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors" data-testid="checkout-cta-btn">Ολοκλήρωση παραγγελίας</Link>
      </div>
    </div>
  );
}

// Helper function to calculate total from items
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}