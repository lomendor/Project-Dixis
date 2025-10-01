import { vi } from 'vitest';

// Shared empty array with both "cart" (array) and ".items" reference:
const makeCartArray = () => {
  const arr: any = [];
  Object.defineProperty(arr, 'items', { get: () => arr });
  return arr as any[];
};

export function makeUseCheckoutMock(partial: Partial<Record<string, any>> = {}) {
  const cartArr = makeCartArray();
  const defaults = {
    cart: cartArr,               // array-like
    totals: { items: 0, shipment: 0, grand: 0 },
    shipping: { methods: [], selected: null },
    payment: { method: null, intent: null },
    form: { customer: { email: '', name: '' }, address: { zip: '', city: '', line1: '' } },
    error: null,
    // actions
    loadCart: vi.fn(async () => ({ ok: true })),
    getShippingQuote: vi.fn(async () => ({ ok: true, methods: [] })),
    selectShipping: vi.fn(),
    selectShippingMethod: vi.fn(),
    selectPaymentMethod: vi.fn(),
    updateCustomerInfo: vi.fn(),
    updateShippingInfo: vi.fn(),
    reset: vi.fn(),
    validateCart: vi.fn(async () => ({ success: true, data: [] })),
    clearError: vi.fn(),
  };
  return { ...defaults, ...partial };
}
