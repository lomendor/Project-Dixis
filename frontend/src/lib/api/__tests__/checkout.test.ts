/**
 * Essential Tests for Core Checkout API Client
 * Minimal test coverage to stay under 300 LOC limit
 */

import { describe, it, expect, vi } from 'vitest';
import { checkoutApi } from '../checkout';
import { apiClient } from '../../api';

// Mock API client
vi.mock('../../api', () => ({ apiClient: { getCart: vi.fn(), checkout: vi.fn() } }));
vi.mock('../../checkout/checkoutValidation', () => ({ validatePostalCodeCity: vi.fn(() => true) }));

describe('CheckoutApiClient Core', () => {
  it('validates cart items successfully', async () => {
    const mockCart = {
      items: [{
        product: { id: 1, name: 'Test', price: '10.00', producer: { name: 'Producer' } },
        quantity: 1, subtotal: '10.00'
      }]
    };
    vi.mocked(apiClient.getCart).mockResolvedValue(mockCart);

    const result = await checkoutApi.getValidatedCart();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('handles API errors', async () => {
    vi.mocked(apiClient.getCart).mockRejectedValue(new Error('Network error'));
    const result = await checkoutApi.getValidatedCart();
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('Πρόβλημα σύνδεσης');
  });

  it('validates order and processes checkout', async () => {
    // Test order validation
    const order = {
      items: [{ id: 1, product_id: 1, name: 'Test', price: 10, quantity: 1, subtotal: 10, producer_name: 'P' }],
      subtotal: 10, shipping_cost: 3, payment_fees: 0, tax_amount: 0, total_amount: 13,
      shipping_method: { id: 'home', name: 'Home', price: 3, estimated_days: 3 },
      payment_method: { id: 'card', type: 'card' as const, name: 'Card' }
    };
    expect(checkoutApi.validateOrderSummary(order).success).toBe(true);

    // Test checkout processing  
    vi.mocked(apiClient.checkout).mockResolvedValue({ id: 'order_1', total: 13 });
    const checkout = {
      customer: { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '2101234567' },
      shipping: { address: 'Test St', city: 'Athens', postalCode: '10671' },
      order, session_id: 'sess_1', terms_accepted: true
    };
    expect((await checkoutApi.processValidatedCheckout(checkout)).success).toBe(true);
  });
});