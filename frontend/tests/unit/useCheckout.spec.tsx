/**
 * useCheckout Hook Tests - Optimized Coverage
 */

import { renderHook, act } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useCheckout } from '../../src/hooks/useCheckout';
import { apiUrl } from '../../src/lib/api';

const server = setupServer();
beforeEach(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); server.close(); });

const mockCart = { cart_items: [{ id: 1, product: { id: 1, name: 'Greek Oil', price: '15.50', producer: { name: 'Producer' } }, quantity: 2, subtotal: '31.00' }] };
const mockShipping = { data: [{ id: 'home', name: 'Home Delivery', price: 5.50, estimated_days: 2 }] };
const mockOrder = { order: { id: 'order_123', total_amount: '42.14', status: 'pending' } };

describe('useCheckout Hook', () => {
  it('loads cart and handles errors', async () => {
    server.use(http.get(apiUrl('cart/items'), () => HttpResponse.json(mockCart)));
    const { result } = renderHook(() => useCheckout());

    await act(async () => await result.current.loadCart());
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart?.[0]).toMatchObject({ product_id: 1, name: 'Greek Oil', price: 15.50, quantity: 2, subtotal: 31.00 });

    server.use(http.get(apiUrl('cart/items'), () => HttpResponse.error()));
    await act(async () => await result.current.loadCart());
    expect(result.current.error).toContain('Σφάλμα σύνδεσης καλαθιού');
  });

  it('gets shipping quotes with validation', async () => {
    server.use(
      http.get(apiUrl('cart/items'), () => HttpResponse.json(mockCart)),
      http.post(apiUrl('shipping/quote'), () => HttpResponse.json(mockShipping))
    );
    const { result } = renderHook(() => useCheckout());

    await act(async () => await result.current.loadCart());
    await act(async () => {
      await result.current.getShippingQuote({ postal_code: '10671', city: 'Athens' });
    });
    expect(result.current.shippingMethods?.length).toBeGreaterThan(0);

    await act(async () => await result.current.getShippingQuote({ postal_code: '123', city: 'Athens' }));
    expect(result.current.error).toContain('Μη έγκυρος ΤΚ (5 ψηφία)');
  });

  it('processes complete checkout with validation and VAT', async () => {
    server.use(
      http.get(apiUrl('cart/items'), () => HttpResponse.json(mockCart)),
      http.post(apiUrl('orders/checkout'), () => HttpResponse.json(mockOrder))
    );
    const { result } = renderHook(() => useCheckout());

    await act(async () => await result.current.loadCart());
    
    act(() => {
      result.current.selectShippingMethod({ id: 'home', name: 'Home', price: 5.50, estimated_days: 2 });
      result.current.selectPaymentMethod({ id: 'cod', type: 'cash_on_delivery', name: 'COD', fixed_fee: 2.00 });
      result.current.updateCustomerInfo({ firstName: 'John', email: 'john@test.com', phone: '2101234567' });
      result.current.updateShippingInfo({ city: 'Athens', postalCode: '10671' });
      result.current.setTermsAccepted(true);
    });

    expect(result.current.calculateOrderSummary()?.tax_amount).toBeCloseTo(7.44, 2); // 24% VAT

    // Test validation
    act(() => result.current.updateCustomerInfo({ firstName: '', email: 'invalid' }));
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.formErrors['customer.firstName']).toBe('Το όνομα είναι υποχρεωτικό');

    // Test checkout
    act(() => result.current.updateCustomerInfo({ firstName: 'John', email: 'john@test.com' }));
    await act(async () => {
      const order = await result.current.processCheckout();
      expect(order?.id).toBe('order_123');
    });
    expect(result.current.completedOrder?.id).toBe('order_123');
  });

  it('validates Greek phone numbers', () => {
    const { result } = renderHook(() => useCheckout());
    
    const cases = [
      { phone: '2101234567', valid: true }, { phone: '+302101234567', valid: true },
      { phone: '6944123456', valid: true }, { phone: '123456', valid: false }, { phone: '+1234567890', valid: false }
    ];

    cases.forEach(({ phone, valid }) => {
      act(() => {
        result.current.updateCustomerInfo({ firstName: 'Test', email: 'test@test.com', phone });
        result.current.updateShippingInfo({ city: 'Athens', postalCode: '10671' });
        result.current.setTermsAccepted(true);
        const isValid = result.current.validateForm();
        expect(isValid).toBe(valid);
        if (!valid) expect(result.current.formErrors['customer.phone']).toBe('Μη έγκυρος αριθμός τηλεφώνου');
      });
    });
  });

  it('handles loading states and clears errors', async () => {
    server.use(http.get(apiUrl('cart/items'), async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return HttpResponse.json(mockCart);
    }));
    
    const { result } = renderHook(() => useCheckout());
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.loadCart();
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current.isLoading).toBe(false);

    // Test error clearing  
    act(() => {
      result.current.updateCustomerInfo({ firstName: '', email: 'invalid' });
      result.current.validateForm();
      expect(Object.keys(result.current.formErrors).length).toBeGreaterThan(0);
      result.current.clearErrors();
      expect(result.current.error).toBeNull();
    });
  });

  it('resets state and handles empty cart', () => {
    const { result } = renderHook(() => useCheckout());
    
    act(() => {
      result.current.updateCustomerInfo({ firstName: 'Test' });
      result.current.reset();
    });
    expect(result.current.form.customer?.firstName).toBe('');
    expect(result.current.cart).toBeNull();

    act(async () => {
      await result.current.getShippingQuote({ postal_code: '10671', city: 'Athens' });
    });
    expect(result.current.error).toBe('Το καλάθι είναι κενό');
  });

  it('handles API validation errors', async () => {
    server.use(http.get(apiUrl('cart/items'), () => HttpResponse.json({ success: false, message: 'Cart not found' })));
    const { result } = renderHook(() => useCheckout());
    
    await act(async () => await result.current.loadCart());
    expect(result.current.error).toBe('Αποτυχία φόρτωσης καλαθιού');
  });
});