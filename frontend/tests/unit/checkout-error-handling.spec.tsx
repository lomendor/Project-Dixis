/**
 * CO-ERR-003: MSW Integration Tests for Error Handling
 * Tests API error scenarios, network failures, and resilience patterns
 */

import React, { useState } from 'react';
import { renderHook, act } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { checkoutErrorHandlers, rateLimitHandlers, networkPartitionHandlers, circuitBreakerTestHandlers } from '../msw/checkout.handlers';

// Mock useCheckout hook interface
interface CheckoutState {
  cart: any[];
  error: string | null;
  loading: boolean;
  shippingMethods: any[];
  loadCart: () => Promise<void>;
  getShippingQuote: (destination: { postal_code: string }) => Promise<void>;
  processCheckout: (orderData: any) => Promise<void>;
  clearError: () => void;
}

// Mock implementation
const useCheckout = (): CheckoutState => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/v1/cart/items', {
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Cart load failed');
      const data = await response.json();
      setCart(data.cart_items || []);
    } catch (err) {
      setError('Σφάλμα σύνδεσης καλαθιού');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const getShippingQuote = async (destination: { postal_code: string }) => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/v1/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Shipping quote failed');
      const data = await response.json();
      setShippingMethods(data.shipping_methods || []);
    } catch (err) {
      setError('Σφάλμα στον υπολογισμό αποστολής');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const processCheckout = async (orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα στην ολοκλήρωση παραγγελίας');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    cart,
    error,
    loading,
    shippingMethods,
    loadCart,
    getShippingQuote,
    processCheckout,
    clearError
  };
};

// MSW server setup
const server = setupServer();

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
  vi.clearAllMocks();
});

describe('CO-ERR-003: MSW Integration Error Handling', () => {
  describe('Network Timeout Scenarios', () => {
    it('handles cart loading timeout gracefully', async () => {
      server.use(
        http.get('/api/v1/cart/items', async () => {
          await delay(10000); // Simulate timeout
          return HttpResponse.json({ cart_items: [] });
        })
      );

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.loadCart();
      });

      expect(result.current.error).toContain('Σφάλμα σύνδεσης καλαθιού');
      expect(result.current.loading).toBe(false);
    });

    it('handles shipping quote timeout', async () => {
      server.use(
        http.post('/api/v1/shipping/quote', async () => {
          await delay(10000);
          return HttpResponse.json({ shipping_methods: [] });
        })
      );

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.getShippingQuote({ postal_code: '10671' });
      });

      expect(result.current.error).toContain('Σφάλμα στον υπολογισμό αποστολής');
    });
  });

  describe('Server Error Responses', () => {
    it('handles 500 server errors during checkout', async () => {
      server.use(...checkoutErrorHandlers);

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.processCheckout({ items: [], total: 100 });
      });

      expect(result.current.error).toContain('Internal server error');
      expect(result.current.loading).toBe(false);
    });

    it('handles validation errors with field details', async () => {
      server.use(
        http.post('/api/v1/orders/checkout', () => {
          return HttpResponse.json({
            errors: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'phone', message: 'Phone number required' }
            ]
          }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.processCheckout({ email: 'invalid-email' });
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Rate Limiting Scenarios', () => {
    it('handles rate limiting gracefully', async () => {
      server.use(...rateLimitHandlers);

      const { result } = renderHook(() => useCheckout());

      // Make multiple requests to trigger rate limit
      for (let i = 0; i < 6; i++) {
        await act(async () => {
          await result.current.loadCart();
        });
      }

      expect(result.current.error).toContain('Σφάλμα σύνδεσης καλαθιού');
    });
  });

  describe('Network Partition Scenarios', () => {
    it('handles partial service failures', async () => {
      server.use(...networkPartitionHandlers);

      const { result } = renderHook(() => useCheckout());

      // Cart loads successfully
      await act(async () => {
        await result.current.loadCart();
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.error).toBeNull();

      // But checkout fails due to network partition
      await act(async () => {
        await result.current.processCheckout({ items: result.current.cart });
      });

      expect(result.current.error).toContain('Network partition');
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('handles intermittent failures', async () => {
      server.use(...circuitBreakerTestHandlers);

      const { result } = renderHook(() => useCheckout());
      let successCount = 0;
      let errorCount = 0;

      // Make multiple requests to test circuit breaker behavior
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.loadCart();
        });

        if (result.current.error) {
          errorCount++;
        } else {
          successCount++;
        }

        // Clear error for next attempt
        act(() => {
          result.current.clearError();
        });
      }

      // Expect some failures due to 30% failure rate
      expect(errorCount).toBeGreaterThan(0);
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    it('allows error clearing and recovery', async () => {
      server.use(
        http.get('/api/v1/cart/items', () => {
          return HttpResponse.json({ error: 'Temporary error' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useCheckout());

      // Trigger error
      await act(async () => {
        await result.current.loadCart();
      });

      expect(result.current.error).toBeTruthy();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();

      // Setup successful response
      server.use(
        http.get('/api/v1/cart/items', () => {
          return HttpResponse.json({ cart_items: [{ id: 1, product: { name: 'Test' }, quantity: 1 }] });
        })
      );

      // Retry should work
      await act(async () => {
        await result.current.loadCart();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('Greek-specific Error Messages', () => {
    it('provides localized error messages', async () => {
      server.use(
        http.post('/api/v1/shipping/quote', () => {
          return HttpResponse.json({ error: 'Invalid postal code for Greece' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.getShippingQuote({ postal_code: '00000' });
      });

      expect(result.current.error).toContain('Σφάλμα στον υπολογισμό αποστολής');
    });
  });
});