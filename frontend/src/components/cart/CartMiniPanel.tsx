/**
 * CartMiniPanel Component - Compact Cart Display
 * Mini panel showing cart items count and total with view cart link
 */

import Link from 'next/link';
import { formatCurrency } from '@/env';

interface CartItem {
  id: number;
  name: string;
  subtotal: number;
}

interface CartMiniPanelProps {
  items: CartItem[];
  totalAmount: number;
  className?: string;
}

export default function CartMiniPanel({ items, totalAmount, className = '' }: CartMiniPanelProps) {
  const itemCount = items.length;

  if (itemCount === 0) {
    return (
      <div className={`bg-gray-50 border rounded-lg p-4 ${className}`} data-testid="cart-mini">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Το καλάθι είναι κενό</p>
          <Link 
            href="/products" 
            className="text-green-600 hover:text-green-700 text-sm underline mt-1 block"
            data-testid="shop-products-link"
          >
            Συνέχεια στην αγορά
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`} data-testid="cart-mini">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Καλάθι</h3>
        <span 
          className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full"
          data-testid="cart-items-count"
        >
          {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600 truncate flex-1 mr-2">{item.name}</span>
            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        {itemCount > 3 && (
          <p className="text-xs text-gray-500">+{itemCount - 3} επιπλέον προϊόντα</p>
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold">
          <span>Σύνολο:</span>
          <span data-testid="cart-total-amount">{formatCurrency(totalAmount)}</span>
        </div>
        <Link 
          href="/cart" 
          className="w-full mt-3 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors block"
          data-testid="cart-view-link"
        >
          Προβολή Καλαθιού
        </Link>
      </div>
    </div>
  );
}