'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, CartItem, ShippingQuote } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect during auth loading to prevent race conditions
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadCart();
  }, [isAuthenticated, authLoading, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await apiClient.getCart();
      setCartItems(cart.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await apiClient.updateCartItem(itemId, newQuantity);
      await loadCart(); // Reload to get updated totals
    } catch (err) {
      console.error('Failed to update quantity:', err);
      showToast('error', 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      await apiClient.removeFromCart(itemId);
      await loadCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      showToast('error', 'Failed to remove item from cart');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      await apiClient.clearCart();
      await loadCart();
      showToast('success', 'Cart cleared successfully');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      showToast('error', 'Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    // Validate shipping information
    if (!postalCode || postalCode.length < 5) {
      showToast('error', 'Please enter a valid postal code (ΤΚ)');
      return;
    }

    if (!city || city.trim().length < 2) {
      showToast('error', 'Please enter a valid city name');
      return;
    }

    if (!shippingQuote) {
      showToast('error', 'Please wait for shipping calculation to complete');
      return;
    }

    try {
      setCheckingOut(true);
      
      // Create full shipping address
      const shippingAddress = `${city}, ${postalCode}${user?.address ? `, ${user.address}` : ''}`;
      
      const order = await apiClient.checkout({
        payment_method: 'cash_on_delivery',
        shipping_method: 'COURIER',
        shipping_address: shippingAddress,
        shipping_cost: shippingQuote.cost,
        shipping_carrier: shippingQuote.carrier,
        shipping_eta_days: shippingQuote.etaDays,
        postal_code: postalCode,
        city: city,
        notes: `Shipping Zone: ${shippingQuote.zone}`,
      });
      
      showToast('success', `Order created! ID: ${order.id}`);
      
      // Redirect to order confirmation page
      router.push(`/orders/${order.id}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate weight and volume (MVP: simple estimates based on product type)
  const calculateShippingMetrics = () => {
    let weight = 0;
    let volume = 0;
    
    cartItems.forEach(item => {
      // MVP weight estimation: 0.3kg per kg for produce, 0.1kg for other items
      const itemWeight = item.product.unit === 'kg' 
        ? item.quantity * 0.3 // Assume 0.3kg per "kg" unit of produce
        : item.quantity * 0.1; // Assume 0.1kg per item for other units
      
      // MVP volume estimation: 0.002 m³ per item (small package)
      const itemVolume = item.quantity * 0.002;
      
      weight += itemWeight;
      volume += itemVolume;
    });
    
    return { 
      weight: Math.max(0.1, weight), // Min 0.1kg
      volume: Math.max(0.001, volume) // Min 0.001 m³
    };
  };

  // Get shipping quote when postal code and city are provided
  const getShippingQuote = async () => {
    if (!postalCode || !city || cartItems.length === 0) {
      setShippingQuote(null);
      return;
    }

    if (postalCode.length < 5) {
      return; // Wait for valid postal code
    }

    try {
      setLoadingShipping(true);
      const { weight, volume } = calculateShippingMetrics();
      
      const quote = await apiClient.getShippingQuote({
        zip: postalCode,
        city: city,
        weight,
        volume
      });
      
      setShippingQuote(quote);
    } catch (err: any) {
      console.error('Failed to get shipping quote:', err);
      
      // Handle specific error cases
      const errorMessage = err.message || 'Could not calculate shipping cost';
      
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        showToast('error', 'Too many requests. Please wait a moment and try again.');
      } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        showToast('error', 'Shipping service temporarily unavailable. Please try again.');
      } else if (errorMessage.includes('400') || errorMessage.includes('422')) {
        showToast('error', 'Invalid postal code or city. Please check your input.');
      } else {
        showToast('error', 'Could not calculate shipping cost. Please try again.');
      }
      
      setShippingQuote(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Effect to get shipping quote when postal code or city changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getShippingQuote();
    }, 500); // Debounce API calls

    return () => clearTimeout(debounceTimer);
  }, [postalCode, city, cartItems]);

  if (authLoading || !isAuthenticated) {
    return null; // Show nothing during auth loading or redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Cart
          </h1>
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your cart..." />
        ) : error ? (
          <ErrorState
            title="Unable to load cart"
            message={error}
            onRetry={loadCart}
          />
        ) : cartItems.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v0a1 1 0 001 1h11M9 19a2 2 0 100 4 2 2 0 000-4zM20 19a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            }
            title="Your cart is empty"
            description="Start shopping to add items to your cart and support local producers."
            actionLabel="Browse Products"
            actionHref="/"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({totalItems})
                    </h2>
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-sm text-red-600 hover:text-red-700"
                        data-testid="clear-cart-button"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} data-testid="cart-item" className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].url || item.product.images[0].image_path}
                              alt={item.product.images[0].alt_text || item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            By {item.product.producer.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-green-600">
                              €{item.product.price} / {item.product.unit}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            data-testid="decrease-quantity"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-sm font-medium" data-testid="quantity-display">
                            {updatingItems.has(item.id) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            data-testid="increase-quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          data-testid="remove-item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                
                {/* Shipping Information */}
                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="postal-code" className="block text-xs font-medium text-gray-700 mb-1">
                        Ταχυδρομικός Κώδικας (ΤΚ)
                      </label>
                      <input
                        type="text"
                        id="postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="11527"
                        maxLength={5}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        data-testid="postal-code-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                        Πόλη
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Athens"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        data-testid="city-input"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Order Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({totalItems})</span>
                    <span className="font-medium">€{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    {loadingShipping ? (
                      <span className="text-sm text-gray-500">Calculating...</span>
                    ) : shippingQuote ? (
                      <div className="text-right">
                        <span className="font-medium">€{shippingQuote.cost.toFixed(2)}</span>
                        <div className="text-xs text-gray-500">{shippingQuote.carrier}</div>
                        <div className="text-xs text-gray-500">{shippingQuote.etaDays} day(s)</div>
                      </div>
                    ) : postalCode && city ? (
                      <span className="text-sm text-gray-500">Enter valid ΤΚ</span>
                    ) : (
                      <span className="text-sm text-gray-500">Enter ΤΚ & city</span>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">
                        €{(totalAmount + (shippingQuote?.cost || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  data-testid="checkout-btn"
                  onClick={handleCheckout}
                  disabled={
                    checkingOut || 
                    cartItems.length === 0 || 
                    !postalCode || 
                    postalCode.length < 5 || 
                    !city || 
                    city.trim().length < 2 ||
                    !shippingQuote ||
                    loadingShipping
                  }
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium"
                >
                  {checkingOut ? 'Processing...' : 
                   loadingShipping ? 'Calculating shipping...' :
                   !postalCode || !city ? 'Enter shipping info to continue' :
                   !shippingQuote ? 'Enter valid ΤΚ and city' :
                   'Proceed to Checkout'}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Payment on delivery. Shipping calculated based on location.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}