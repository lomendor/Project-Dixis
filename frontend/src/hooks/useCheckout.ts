/**
 * useCheckout React Hook - Minimal Implementation
 * Essential checkout flow management with Greek validation
 */

import { useState, useCallback } from 'react';
import { checkoutApi } from '../lib/api/checkout';
import type { CheckoutForm, CartLine, ShippingMethod, PaymentMethod, OrderSummary } from '../lib/validation/checkout';
import type { Order } from '../lib/api';

export interface UseCheckoutReturn {
  isLoading: boolean;
  cart: CartLine[] | null;
  shippingMethods: ShippingMethod[] | null;
  selectedShippingMethod: ShippingMethod | null;
  selectedPaymentMethod: PaymentMethod | null;
  form: Partial<CheckoutForm>;
  formErrors: Record<string, string>;
  completedOrder: Order | null;
  error: string | null;
  loadCart: () => Promise<void>;
  getShippingQuote: (destination: { postal_code: string; city: string }) => Promise<void>;
  selectShippingMethod: (method: ShippingMethod) => void;
  selectPaymentMethod: (method: PaymentMethod) => void;
  updateCustomerInfo: (customer: Partial<CheckoutForm['customer']>) => void;
  updateShippingInfo: (shipping: Partial<CheckoutForm['shipping']>) => void;
  setTermsAccepted: (accepted: boolean) => void;
  validateForm: () => boolean;
  calculateOrderSummary: () => OrderSummary | null;
  processCheckout: () => Promise<Order | null>;
  reset: () => void;
  clearErrors: () => void;
}

// Main hook with simplified useState
export const useCheckout = (): UseCheckoutReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartLine[] | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[] | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState<Partial<CheckoutForm>>({
    customer: { firstName: '', lastName: '', email: '', phone: '' },
    shipping: { address: '', city: '', postalCode: '', notes: '' },
    terms_accepted: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🛒 Loading cart...');
      const result = await checkoutApi.getValidatedCart();
      console.log('🛒 Cart result:', { success: result.success, itemCount: result.data?.length, errors: result.errors });
      if (result.success && result.data) {
        setCart(result.data);
        console.log('🛒 Cart set with', result.data.length, 'items');
      } else {
        // Check if the error indicates a network/connection issue
        const hasNetworkError = result.errors.some(err => err.message.includes('σύνδεσης') || err.code === 'RETRYABLE_ERROR');
        setError(hasNetworkError ? 'Σφάλμα σύνδεσης καλαθιού' : 'Αποτυχία φόρτωσης καλαθιού');
        console.log('🛒 Cart error:', result.errors);
      }
    } catch (err) {
      console.log('🛒 Cart exception:', err);
      setError('Σφάλμα σύνδεσης καλαθιού');
    } finally {
      setIsLoading(false);
      console.log('🛒 Loading set to false');
    }
  }, []);

  const getShippingQuote = useCallback(async (destination: { postal_code: string; city: string }) => {
    if (!cart?.length) return setError('Το καλάθι είναι κενό');
    if (!/^\d{5}$/.test(destination.postal_code)) return setError('Μη έγκυρος ΤΚ (5 ψηφία)');
    setIsLoading(true);
    setError(null);
    try {
      const result = await checkoutApi.getShippingQuote({
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        destination
      });
      result.success && result.data ? setShippingMethods(result.data) : setError('Αποτυχία υπολογισμού μεταφορικών');
    } catch {
      setError('Σφάλμα σύνδεσης μεταφορικών');
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const updateCustomerInfo = useCallback((customer: Partial<CheckoutForm['customer']>) => {
    setForm(prev => ({ ...prev, customer: { ...prev.customer, ...customer } }));
  }, []);
  const updateShippingInfo = useCallback((shipping: Partial<CheckoutForm['shipping']>) => {
    setForm(prev => ({ ...prev, shipping: { ...prev.shipping, ...shipping } }));
  }, []);
  const setTermsAccepted = useCallback((accepted: boolean) => {
    setForm(prev => ({ ...prev, terms_accepted: accepted }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const { customer, shipping } = form;
    if (!customer?.firstName?.trim()) errors['customer.firstName'] = 'Το όνομα είναι υποχρεωτικό';
    if (!customer?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors['customer.email'] = 'Μη έγκυρη διεύθυνση email';
    if (!customer?.phone?.trim() || !/^(\+30|0030|30)?[2-9]\d{8,9}$/.test(customer.phone)) errors['customer.phone'] = 'Μη έγκυρος αριθμός τηλεφώνου';
    if (!shipping?.city?.trim()) errors['shipping.city'] = 'Η πόλη είναι υποχρεωτική';
    if (!shipping?.postalCode?.trim() || !/^\d{5}$/.test(shipping.postalCode)) errors['shipping.postalCode'] = 'Μη έγκυρος ΤΚ (5 ψηφία)';
    if (!form.terms_accepted) errors['terms_accepted'] = 'Πρέπει να αποδεχτείτε τους όρους';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const calculateOrderSummary = useCallback((): OrderSummary | null => {
    if (!cart || !selectedShippingMethod || !selectedPaymentMethod) return null;
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = Math.round(subtotal * 0.24 * 100) / 100; // Fix floating point precision
    return {
      items: cart, subtotal, shipping_method: selectedShippingMethod, shipping_cost: selectedShippingMethod.price,
      payment_method: selectedPaymentMethod, payment_fees: selectedPaymentMethod.fixed_fee || 0, tax_amount: taxAmount,
      total_amount: subtotal + selectedShippingMethod.price + (selectedPaymentMethod.fixed_fee || 0) + taxAmount
    };
  }, [cart, selectedShippingMethod, selectedPaymentMethod]);

  const processCheckout = useCallback(async (): Promise<Order | null> => {
    if (!validateForm()) return null;
    const orderSummary = calculateOrderSummary();
    if (!orderSummary) return setError('Δεν είναι δυνατός ο υπολογισμός της παραγγελίας'), null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await checkoutApi.processValidatedCheckout({
        ...form, order: orderSummary, session_id: `checkout_${Date.now()}`, created_at: new Date().toISOString()
      });
      if (result.success && result.data) {
        setCompletedOrder(result.data);
        return result.data;
      }
      setError('Αποτυχία επεξεργασίας παραγγελίας');
      return null;
    } catch {
      setError('Σφάλμα επεξεργασίας παραγγελίας');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [form, validateForm, calculateOrderSummary]);

  const reset = useCallback(() => {
    setCart(null); setShippingMethods(null); setSelectedShippingMethod(null); setSelectedPaymentMethod(null);
    setForm({ customer: { firstName: '', lastName: '', email: '', phone: '' }, shipping: { address: '', city: '', postalCode: '', notes: '' }, terms_accepted: false });
    setFormErrors({}); setCompletedOrder(null); setError(null);
  }, []);
  const clearErrors = useCallback(() => { setError(null); setFormErrors({}); }, []);

  return {
    isLoading,
    cart,
    shippingMethods,
    selectedShippingMethod,
    selectedPaymentMethod,
    form,
    formErrors,
    completedOrder,
    error,
    loadCart,
    getShippingQuote,
    selectShippingMethod: setSelectedShippingMethod,
    selectPaymentMethod: setSelectedPaymentMethod,
    updateCustomerInfo,
    updateShippingInfo,
    setTermsAccepted,
    validateForm,
    calculateOrderSummary,
    processCheckout,
    reset,
    clearErrors
  };
};