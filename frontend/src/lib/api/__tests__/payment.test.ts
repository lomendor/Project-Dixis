/**
 * Payment API Tests
 * Unit tests for payment API client functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentApi } from '../payment';

// Mock fetch globally
global.fetch = vi.fn();

describe('Payment API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('should fetch payment methods', async () => {
    const mockResponse = {
      active_provider: 'stripe',
      supported_payment_methods: ['card', 'cash_on_delivery'],
      available_providers: ['stripe', 'fake'],
      stripe_public_key: 'pk_test_123'
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await paymentApi.getPaymentMethods();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payment/methods'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should initialize payment with auth token', async () => {
    const mockToken = 'test_token';
    const mockResponse = {
      message: 'Payment initialized successfully',
      payment: {
        client_secret: 'pi_test_client_secret',
        payment_intent_id: 'pi_test_123',
        amount: 10000,
        currency: 'eur',
        status: 'requires_payment_method',
        payment_method_types: ['card']
      },
      order: {
        id: 1,
        total_amount: '100.00',
        payment_status: 'pending'
      }
    };

    vi.mocked(window.localStorage.getItem).mockReturnValue(mockToken);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await paymentApi.initPayment(1, {
      customer: { email: 'test@example.com' },
      return_url: 'http://test.com'
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/1/payment/init'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token',
        }),
        body: JSON.stringify({
          customer: { email: 'test@example.com' },
          return_url: 'http://test.com'
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should confirm payment', async () => {
    const mockResponse = {
      message: 'Payment confirmed successfully',
      payment: {
        payment_intent_id: 'pi_test_123',
        status: 'succeeded',
        amount_received: 10000,
        currency: 'eur',
        paid_at: '2023-01-01T00:00:00Z'
      },
      order: {
        id: 1,
        payment_status: 'paid',
        status: 'paid'
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await paymentApi.confirmPayment(1, 'pi_test_123');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders/1/payment/confirm'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ payment_intent_id: 'pi_test_123' }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockErrorResponse = {
      message: 'Order not found'
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve(mockErrorResponse),
    });

    await expect(paymentApi.initPayment(999)).rejects.toThrow('HTTP 404: Order not found');
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(paymentApi.getPaymentMethods()).rejects.toThrow('Network error');
  });
});