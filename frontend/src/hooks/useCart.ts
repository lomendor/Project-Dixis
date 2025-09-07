/**
 * useCart Hook - Cart State Management 
 * PR-88c-3A: Cart Container + Wire-up
 * 
 * Local state management with mock API integration
 * Provides cart items, totals calculation, and basic actions
 */

import { useState, useEffect, useCallback } from 'react';
import type { CartLine } from '../lib/validation/checkout';

interface CartState {
  items: CartLine[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

interface UseCartReturn extends CartState {
  loadCart: () => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearError: () => void;
}

// Greek VAT rate (24%)
const GREEK_VAT_RATE = 0.24;
const DEFAULT_SHIPPING_COST = 5.50;

export function useCart(): UseCartReturn {
  const [state, setState] = useState<CartState>({
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 0,
    isLoading: false,
    error: null,
  });

  // Calculate totals from items
  const calculateTotals = useCallback((items: CartLine[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = items.length > 0 ? DEFAULT_SHIPPING_COST : 0;
    const taxAmount = Math.round((subtotal + shippingCost) * GREEK_VAT_RATE * 100) / 100;
    const totalAmount = Math.round((subtotal + shippingCost + taxAmount) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost,
      taxAmount,
      totalAmount,
    };
  }, []);

  // Load cart from API (mock)
  const loadCart = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call - will be intercepted by MSW
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to load cart');
      }
      
      const data = await response.json();
      const items = data.cart_items?.map((item: any) => ({
        id: item.id,
        product_id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal),
        producer_name: item.product.producer?.name || 'Producer',
      })) || [];
      
      const totals = calculateTotals(items);
      
      setState(prev => ({
        ...prev,
        items,
        ...totals,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Σφάλμα φόρτωσης καλαθιού',
        isLoading: false,
      }));
    }
  }, [calculateTotals]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity < 1 || quantity > 99) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      // Update local state optimistically
      setState(prev => {
        const updatedItems = prev.items.map(item => {
          if (item.id === itemId) {
            const subtotal = Math.round(item.price * quantity * 100) / 100;
            return { ...item, quantity, subtotal };
          }
          return item;
        });
        
        const totals = calculateTotals(updatedItems);
        
        return {
          ...prev,
          items: updatedItems,
          ...totals,
          isLoading: false,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Σφάλμα ενημέρωσης ποσότητας',
        isLoading: false,
      }));
    }
  }, [calculateTotals]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock API call
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      // Update local state
      setState(prev => {
        const updatedItems = prev.items.filter(item => item.id !== itemId);
        const totals = calculateTotals(updatedItems);
        
        return {
          ...prev,
          items: updatedItems,
          ...totals,
          isLoading: false,
        };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Σφάλμα αφαίρεσης προϊόντος',
        isLoading: false,
      }));
    }
  }, [calculateTotals]);

  // Clear error message
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return {
    ...state,
    loadCart,
    updateQuantity,
    removeItem,
    clearError,
  };
}