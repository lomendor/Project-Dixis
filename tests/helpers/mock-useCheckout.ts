import { vi } from 'vitest';

export function makeUseCheckoutMock(partial: Partial<ReturnType<any>> = {}) {
  return {
    cart: { items: [], total: 0, ...partial.cart },
    shipping: { methods: [], selected: null, ...partial.shipping },
    error: null,
    loading: false,
    shippingMethods: [],
    processCheckout: vi.fn(async () => ({ ok: true, orderId: 'ord_test_1' })),
    loadCart: vi.fn(async () => ({ ok: true })),
    getShippingQuote: vi.fn(async () => ({ ok: true, methods: [] })),
    selectShipping: vi.fn(),
    validateCart: vi.fn(async () => ({ success: true, data: [] })),
    clearError: vi.fn(),
    ...partial,
  };
}
