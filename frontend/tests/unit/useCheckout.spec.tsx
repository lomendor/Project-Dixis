/**
 * useCheckout Hook Tests - Core Coverage Only
 */

import { renderHook, act } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { useCheckout } from '../../src/hooks/useCheckout';
import { apiUrl } from '../../src/lib/api';

const server = setupServer();
beforeEach(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); server.close(); });

// Mock data
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

  it('gets shipping quotes with Greek postal validation', async () => {
    server.use(
      http.get(apiUrl('cart/items'), () => HttpResponse.json(mockCart)),
      http.post(apiUrl('shipping/quote'), () => HttpResponse.json(mockShipping))
    );
    const { result } = renderHook(() => useCheckout());

    await act(async () => await result.current.loadCart());
    await act(async () => await result.current.getShippingQuote({ postal_code: '10671', city: 'Athens' }));
    expect(result.current.shippingMethods).toHaveLength(1);

    await act(async () => await result.current.getShippingQuote({ postal_code: '123', city: 'Athens' }));
    expect(result.current.error).toContain('Μη έγκυρος ΤΚ (5 ψηφία)');
  });

  it('validates form and processes complete checkout with Greek VAT', async () => {
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

    expect(result.current.form.terms_accepted).toBe(true);
    
    // Test VAT calculation
    const summary = result.current.calculateOrderSummary();
    expect(summary?.tax_amount).toBe(7.44); // 24% VAT

    // Test validation
    act(() => result.current.updateCustomerInfo({ firstName: '', email: 'invalid' }));
    let isValid;
    act(() => { isValid = result.current.validateForm(); });
    expect(isValid).toBe(false);
    expect(result.current.formErrors['customer.firstName']).toBe('Το όνομα είναι υποχρεωτικό');

    // Test checkout processing
    act(() => result.current.updateCustomerInfo({ firstName: 'John', email: 'john@test.com' }));
    await act(async () => {
      const order = await result.current.processCheckout();
      expect(order?.id).toBe('order_123');
    });

    expect(result.current.completedOrder?.id).toBe('order_123');
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useCheckout());

    act(() => {
      result.current.updateCustomerInfo({ firstName: 'Test' });
      result.current.reset();
    });

    expect(result.current.form.customer?.firstName).toBe('');
    expect(result.current.cart).toBeNull();
  });
});