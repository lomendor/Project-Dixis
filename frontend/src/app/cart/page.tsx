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
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/env';
import CartItemSkeleton, { OrderSummarySkeleton } from '@/components/cart/CartItemSkeleton';
import '@/styles/cart-animations.css';
// Enhanced checkout validation and retry logic
import { 
  validateCheckoutPayload, 
  validatePostalCodeCity, 
  CheckoutValidationError,
  CheckoutHttpError,
  getErrorMessage
} from '@/lib/checkout/checkoutValidation';
import { 
  shippingRetryManager, 
  ShippingRetryState 
} from '@/lib/checkout/shippingRetry';

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
  const [retryState, setRetryState] = useState<ShippingRetryState>(shippingRetryManager.getState());
  const [validationErrors, setValidationErrors] = useState<CheckoutValidationError[]>([]);
  const [useFallbackShipping, setUseFallbackShipping] = useState(false);
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { trackCheckoutStart, trackOrderComplete } = useAnalytics();
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
  
  // Subscribe to shipping retry state changes
  useEffect(() => {
    const unsubscribe = shippingRetryManager.onStateChange(setRetryState);
    return unsubscribe;
  }, []);

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
    // Enhanced Greek confirmation dialog
    const confirmMessage = `Είστε βέβαιοι ότι θέλετε να αδειάσετε το καλάθι σας?\n\nΘα αφαιρεθούν ${totalItems} προϊόντα συνολικής αξίας ${formatCurrency(totalAmount)}.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await apiClient.clearCart();
      await loadCart();
      showToast('success', '✅ Το καλάθι αδειάστηκε επιτυχώς!');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      showToast('error', '❌ Σφάλμα κατά την εκκαθάριση του καλαθιού. Δοκιμάστε ξανά.');
    }
  };

  const handleCheckout = async () => {
    // Enhanced validation with Greek postal codes
    const checkoutData = {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.address || '', // Use address field as phone for now
      address: user?.address || '',
      city,
      postalCode
    };
    
    // Comprehensive validation
    const validation = validateCheckoutPayload(checkoutData);
    console.log('🔍 Checkout validation proof:', validation.proof);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast('error', 'Παρακαλώ διορθώστε τα σφάλματα στη φόρμα');
      return;
    }
    
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate postal code and city combination
    if (!validatePostalCodeCity(postalCode, city)) {
      showToast('error', 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα');
      return;
    }

    if (!shippingQuote && !useFallbackShipping) {
      showToast('error', 'Παρακαλώ περιμένετε τον υπολογισμό μεταφορικών ή χρησιμοποιήστε εκτιμώμενο κόστος');
      return;
    }

    try {
      setCheckingOut(true);
      
      // Track checkout start event
      trackCheckoutStart(
        totalAmount + (shippingQuote?.cost || 0),
        totalItems,
        user?.id?.toString()
      );
      
      // Create full shipping address
      const shippingAddress = `${city}, ${postalCode}${user?.address ? `, ${user.address}` : ''}`;
      
      // Use actual quote or fallback
      const finalQuote = shippingQuote || shippingRetryManager.getFallbackShippingQuote({
        zip: postalCode,
        city,
        weight: calculateShippingMetrics().weight,
        volume: calculateShippingMetrics().volume
      });
      
      console.log('🛒 Creating order with quote:', finalQuote);
      
      const order = await apiClient.checkout({
        payment_method: 'cash_on_delivery',
        shipping_method: 'COURIER',
        shipping_address: shippingAddress,
        shipping_cost: finalQuote.cost,
        shipping_carrier: finalQuote.carrier,
        shipping_eta_days: finalQuote.etaDays,
        postal_code: postalCode,
        city: city,
        notes: `Shipping Zone: ${finalQuote.zone || 'Standard'}${useFallbackShipping ? ' (Εκτιμώμενα μεταφορικά)' : ''}`,
      });
      
      // Track successful order completion
      trackOrderComplete(
        order.id.toString(),
        totalAmount + finalQuote.cost,
        totalItems,
        'cash_on_delivery',
        user?.id?.toString()
      );
      
      showToast('success', `Η παραγγελία δημιουργήθηκε! Κωδικός: ${order.id}`);
      
      // Redirect to order confirmation page
      router.push(`/orders/${order.id}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      
      // Enhanced error handling with Greek messages
      let errorMessage = 'Η ολοκλήρωση της παραγγελίας απέτυχε. Παρακαλώ δοκιμάστε ξανά.';
      
      if (err instanceof Error) {
        if (err.message.includes('422')) {
          errorMessage = 'Τα στοιχεία παραγγελίας δεν είναι έγκυρα. Παρακαλώ ελέγξτε τα στοιχεία σας.';
        } else if (err.message.includes('429')) {
          errorMessage = 'Πολλές αιτήσεις. Παρακαλώ περιμένετε και δοκιμάστε ξανά.';
        } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
          errorMessage = 'Προσωρινό πρόβλημα με τον διακομιστή. Παρακαλώ δοκιμάστε ξανά σε λίγο.';
        } else if (err.name === 'TypeError' || err.message.includes('fetch')) {
          errorMessage = 'Πρόβλημα σύνδεσης. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
        }
      }
      
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

  // Enhanced shipping quote with retry logic and fallback
  const getShippingQuote = async () => {
    if (!postalCode || !city || cartItems.length === 0) {
      setShippingQuote(null);
      setUseFallbackShipping(false);
      return;
    }

    if (postalCode.length < 5) {
      return; // Wait for valid postal code
    }
    
    // Validate postal code and city combination first
    if (!validatePostalCodeCity(postalCode, city)) {
      showToast('error', 'Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα');
      return;
    }

    try {
      setLoadingShipping(true);
      setUseFallbackShipping(false);
      const { weight, volume } = calculateShippingMetrics();
      
      const request = {
        zip: postalCode,
        city: city,
        weight,
        volume
      };
      
      // Use retry manager for shipping quote
      const quote = await shippingRetryManager.getShippingQuoteWithRetry(
        (data) => apiClient.getShippingQuote(data),
        request
      );
      
      if (quote) {
        setShippingQuote(quote);
        setUseFallbackShipping(false);
        console.log('✅ Shipping quote successful:', quote);
      } else {
        // Use fallback shipping quote
        const fallbackQuote = shippingRetryManager.getFallbackShippingQuote(request);
        setShippingQuote(fallbackQuote);
        setUseFallbackShipping(true);
        console.log('🔄 Using fallback shipping quote:', fallbackQuote);
        
        showToast('warning', 'Χρησιμοποιείται εκτιμώμενο κόστος μεταφορικών. Το ακριβές κόστος θα υπολογιστεί κατά την επιβεβαίωση.');
      }
    } catch (err: any) {
      console.error('Shipping quote completely failed:', err);
      
      // Final fallback
      const { weight, volume } = calculateShippingMetrics();
      const fallbackQuote = shippingRetryManager.getFallbackShippingQuote({
        zip: postalCode,
        city,
        weight,
        volume
      });
      
      setShippingQuote(fallbackQuote);
      setUseFallbackShipping(true);
      showToast('error', 'Δεν ήταν δυνατός ο υπολογισμός μεταφορικών. Χρησιμοποιείται εκτιμώμενο κόστος.');
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
            Το Καλάθι Σας
          </h1>
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
          >
            ← Συνέχεια Αγορών
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                  <CartItemSkeleton count={3} />
                </div>
              </div>
            </div>
            {/* Order Summary Skeleton */}
            <div className="lg:col-span-1">
              <OrderSummarySkeleton />
            </div>
          </div>
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
                      <div 
                        key={item.id} 
                        data-testid="cart-item" 
                        className={`cart-item-enter flex items-center space-x-4 p-4 border border-gray-200 rounded-lg transition-all duration-300 ${
                          updatingItems.has(item.id) ? 'bg-gray-50 border-gray-300' : 'hover:shadow-sm'
                        }`}
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.images.length > 0 && item.product.images[0] ? (
                            <img
                              src={item.product.images[0].url || item.product.images[0].image_path}
                              alt={item.product.images[0].alt_text || item.product.name}
                              className="w-full h-full object-cover rounded-lg transition-transform duration-200 hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">Χωρίς εικόνα</span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate" aria-label={`Προϊόν: ${item.product.name}`}>
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600" aria-label={`Παραγωγός: ${item.product.producer.name}`}>
                            Από {item.product.producer.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-sm font-medium text-green-600 transition-colors duration-200 ${
                              updatingItems.has(item.id) ? 'price-change' : ''
                            }`}>
                              {formatCurrency(parseFloat(item.product.price))} / {item.product.unit}
                            </span>
                          </div>
                        </div>

                        {/* Enhanced Quantity Controls */}
                        <div className="flex items-center space-x-2" role="group" aria-label="Έλεγχος ποσότητας">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id)}
                            className={`mobile-tap-target w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-all duration-200 focus-enhanced ${
                              updatingItems.has(item.id) 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-95'
                            }`}
                            data-testid="decrease-quantity"
                            aria-label={`Μείωση ποσότητας ${item.product.name}`}
                          >
                            <span className="text-lg font-medium">−</span>
                          </button>
                          <div className={`quantity-transition w-16 text-center ${
                            updatingItems.has(item.id) ? 'quantity-updating' : ''
                          }`}>
                            <span 
                              className={`text-sm font-medium px-3 py-1 rounded-md ${
                                updatingItems.has(item.id) 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                              data-testid="quantity-display"
                              aria-label={`Ποσότητα: ${updatingItems.has(item.id) ? 'ενημέρωση' : item.quantity}`}
                            >
                              {updatingItems.has(item.id) ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                </div>
                              ) : (
                                item.quantity
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className={`mobile-tap-target w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-all duration-200 focus-enhanced ${
                              updatingItems.has(item.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-green-50 hover:border-green-300 hover:text-green-600 active:scale-95'
                            }`}
                            data-testid="increase-quantity"
                            aria-label={`Αύξηση ποσότητας ${item.product.name}`}
                          >
                            <span className="text-lg font-medium">+</span>
                          </button>
                        </div>

                        {/* Enhanced Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className={`mobile-tap-target p-2 text-red-600 rounded-full transition-all duration-200 focus-enhanced ${
                            updatingItems.has(item.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-red-50 hover:text-red-700 active:scale-95'
                          }`}
                          data-testid="remove-item"
                          aria-label={`Αφαίρεση ${item.product.name} από το καλάθι`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 sticky-cart-summary">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Σύνοψη Παραγγελίας
                </h2>
                
                {/* Enhanced Shipping Information with Validation */}
                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="postal-code" className="block text-xs font-medium text-gray-700 mb-1">
                        Ταχυδρομικός Κώδικας (ΤΚ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="11527"
                        maxLength={5}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                          validationErrors.find(e => e.field === 'postalCode')
                            ? 'border-red-300 bg-red-50'
                            : postalCode && !validatePostalCodeCity(postalCode, city) && postalCode.length === 5 && city
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300'
                        }`}
                        data-testid="postal-code-input"
                      />
                      {validationErrors.find(e => e.field === 'postalCode') && (
                        <p className="mt-1 text-xs text-red-600">
                          {validationErrors.find(e => e.field === 'postalCode')?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                        Πόλη <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Αθήνα / Athens"
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                          validationErrors.find(e => e.field === 'city')
                            ? 'border-red-300 bg-red-50'
                            : city && postalCode && !validatePostalCodeCity(postalCode, city) && postalCode.length === 5
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300'
                        }`}
                        data-testid="city-input"
                      />
                      {validationErrors.find(e => e.field === 'city') && (
                        <p className="mt-1 text-xs text-red-600">
                          {validationErrors.find(e => e.field === 'city')?.message}
                        </p>
                      )}
                      {city && postalCode && !validatePostalCodeCity(postalCode, city) && postalCode.length === 5 && (
                        <p className="mt-1 text-xs text-yellow-600">
                          Η πόλη δεν αντιστοιχεί στον ταχυδρομικό κώδικα
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Validation Error Summary */}
                  {validationErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Διορθώστε τα παρακάτω σφάλματα:
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error.message}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Order Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Προϊόντα ({totalItems})</span>
                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Μεταφορικά</span>
                    {retryState.isLoading ? (
                      <div className="text-right">
                        <div className="flex items-center text-sm text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Υπολογισμός...
                        </div>
                        {retryState.currentAttempt > 1 && (
                          <div className="text-xs text-gray-500">
                            Προσπάθεια {retryState.currentAttempt}/{retryState.maxAttempts}
                          </div>
                        )}
                        {retryState.nextRetryIn > 0 && (
                          <div className="text-xs text-gray-500">
                            Επανάληψη σε {Math.ceil(retryState.nextRetryIn / 1000)}s
                          </div>
                        )}
                      </div>
                    ) : shippingQuote ? (
                      <div className="text-right">
                        <span className={`font-medium ${
                          useFallbackShipping ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(shippingQuote.cost)}
                          {useFallbackShipping && (
                            <span className="text-xs text-yellow-600 ml-1">(εκτ.)</span>
                          )}
                        </span>
                        <div className="text-xs text-gray-500">{shippingQuote.carrier}</div>
                        <div className="text-xs text-gray-500">{shippingQuote.etaDays} ημέρες</div>
                        {useFallbackShipping && (
                          <div className="text-xs text-yellow-600">Εκτιμώμενο κόστος</div>
                        )}
                      </div>
                    ) : retryState.error && !retryState.isLoading ? (
                      <div className="text-right">
                        <span className="text-sm text-red-500">Σφάλμα υπολογισμού</span>
                        <button
                          onClick={() => {
                            shippingRetryManager.reset();
                            getShippingQuote();
                          }}
                          className="block text-xs text-blue-600 hover:text-blue-700 underline mt-1"
                        >
                          Δοκιμή ξανά
                        </button>
                      </div>
                    ) : postalCode && city ? (
                      <span className="text-sm text-gray-500">Εισάγετε έγκυρο ΤΚ</span>
                    ) : (
                      <span className="text-sm text-gray-500">Εισάγετε ΤΚ & πόλη</span>
                    )}
                  </div>
                  
                  {/* Shipping Status Messages */}
                  {retryState.error && retryState.currentAttempt === retryState.maxAttempts && !retryState.isLoading && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-4 w-4 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm text-yellow-700">
                            Χρησιμοποιείται εκτιμώμενο κόστος μεταφορικών. Το ακριβές κόστος θα υπολογιστεί κατά την επιβεβαίωση.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Σύνολο</span>
                      <span className="text-green-600">
                        {formatCurrency(totalAmount + (shippingQuote?.cost || 0))}
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
                    (!shippingQuote && !useFallbackShipping) ||
                    retryState.isLoading ||
                    validationErrors.length > 0 ||
                    Boolean(postalCode && city && !validatePostalCodeCity(postalCode, city))
                  }
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    checkingOut || 
                    cartItems.length === 0 || 
                    !postalCode || 
                    postalCode.length < 5 || 
                    !city || 
                    city.trim().length < 2 ||
                    (!shippingQuote && !useFallbackShipping) ||
                    retryState.isLoading ||
                    validationErrors.length > 0 ||
                    (postalCode && city && !validatePostalCodeCity(postalCode, city))
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : useFallbackShipping
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {checkingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Επεξεργασία...
                    </div>
                  ) : retryState.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Υπολογισμός μεταφορικών...
                    </div>
                  ) : validationErrors.length > 0 ? (
                    'Διορθώστε τα σφάλματα'
                  ) : !postalCode || !city ? (
                    'Εισάγετε στοιχεία αποστολής'
                  ) : postalCode.length < 5 ? (
                    'Εισάγετε έγκυρο ΤΚ (5 ψηφία)'
                  ) : !validatePostalCodeCity(postalCode, city) ? (
                    'Ελέγξτε ΤΚ και πόλη'
                  ) : !shippingQuote && !useFallbackShipping ? (
                    'Αναμονή υπολογισμού μεταφορικών'
                  ) : useFallbackShipping ? (
                    'Συνέχεια με εκτιμώμενα μεταφορικά'
                  ) : (
                    'Ολοκλήρωση Παραγγελίας'
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Πληρωμή με αντικαταβολή. Μεταφορικά υπολογίζονται βάση της τοποθεσίας.
                  </p>
                  {useFallbackShipping && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Χρήση εκτιμώμενων μεταφορικών - το ακριβές κόστος θα επιβεβαιωθεί
                    </p>
                  )}
                  {postalCode && city && validatePostalCodeCity(postalCode, city) && shippingQuote && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Έγκυρος ταχυδρομικός κώδικας για {city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}