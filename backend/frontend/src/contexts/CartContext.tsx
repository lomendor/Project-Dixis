'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, CartItem, CartResponse } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  // State
  cart: CartResponse | null;
  isLoading: boolean;
  
  // Computed values with Greek formatting
  totalAmount: string;
  totalItems: number;
  formattedTotal: string;
  
  // Actions
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  
  // Helpers
  getItemQuantity: (productId: number) => number;
  isInCart: (productId: number) => boolean;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // Computed values with memoization for performance
  const totalAmount = useMemo(() => {
    return cart?.total_amount || '0.00';
  }, [cart?.total_amount]);

  const totalItems = useMemo(() => {
    return cart?.total_items || 0;
  }, [cart?.total_items]);

  const formattedTotal = useMemo(() => {
    const amount = parseFloat(totalAmount);
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, [totalAmount]);

  const cartItemCount = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart?.items]);

  // Load cart when user authenticates
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const cartData = await apiClient.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Don't show error toast for cart loading - it's background operation
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart on mount and auth changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Helper functions
  const getItemQuantity = useCallback((productId: number): number => {
    const item = cart?.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  }, [cart?.items]);

  const isInCart = useCallback((productId: number): boolean => {
    return getItemQuantity(productId) > 0;
  }, [getItemQuantity]);

  // Cart actions with optimistic updates
  const addToCart = useCallback(async (productId: number, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) {
      showToast('error', 'Please log in to add items to cart');
      return false;
    }

    try {
      setIsLoading(true);
      
      // Optimistic update - add item immediately
      if (cart) {
        const existingItem = cart.items.find(item => item.product.id === productId);
        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + quantity;
          const updatedItems = cart.items.map(item => 
            item.product.id === productId 
              ? { ...item, quantity: newQuantity, subtotal: (parseFloat(item.product.price) * newQuantity).toFixed(2) }
              : item
          );
          
          const newTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
          const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          setCart({
            items: updatedItems,
            total_items: newTotalItems,
            total_amount: newTotal.toFixed(2)
          });
        } else {
          // This is a new item - we'll need to fetch product info from the API response
          // For now, keep the optimistic update simple and rely on refresh
        }
      }

      const response = await apiClient.addToCart(productId, quantity);
      
      // Refresh cart to get accurate data
      await loadCart();
      
      showToast('success', `${quantity} item(s) added to cart!`);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      showToast('error', message);
      
      // Revert optimistic update by refreshing
      await loadCart();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, cart, showToast, loadCart]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      
      // Optimistic update
      if (cart) {
        const updatedItems = cart.items.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity, subtotal: (parseFloat(item.product.price) * quantity).toFixed(2) }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        setCart({
          items: updatedItems,
          total_items: newTotalItems,
          total_amount: newTotal.toFixed(2)
        });
      }

      await apiClient.updateCartItem(cartItemId, quantity);
      
      // Refresh to ensure accuracy
      await loadCart();
      return true;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      const message = error instanceof Error ? error.message : 'Failed to update item quantity';
      showToast('error', message);
      
      // Revert optimistic update
      await loadCart();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, cart, showToast, loadCart]);

  const removeItem = useCallback(async (cartItemId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      
      // Optimistic update
      if (cart) {
        const updatedItems = cart.items.filter(item => item.id !== cartItemId);
        const newTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        setCart({
          items: updatedItems,
          total_items: newTotalItems,
          total_amount: newTotal.toFixed(2)
        });
      }

      await apiClient.removeFromCart(cartItemId);
      showToast('success', 'Item removed from cart');
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      const message = error instanceof Error ? error.message : 'Failed to remove item';
      showToast('error', message);
      
      // Revert optimistic update
      await loadCart();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, cart, showToast, loadCart]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setIsLoading(true);
      
      // Optimistic update
      setCart({
        items: [],
        total_items: 0,
        total_amount: '0.00'
      });

      await apiClient.clearCart();
      showToast('success', 'Cart cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      showToast('error', message);
      
      // Revert optimistic update
      await loadCart();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast, loadCart]);

  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  const contextValue: CartContextType = {
    // State
    cart,
    isLoading,
    
    // Computed values
    totalAmount,
    totalItems,
    formattedTotal,
    
    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    
    // Helpers
    getItemQuantity,
    isInCart,
    cartItemCount
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };