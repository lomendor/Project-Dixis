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
    shippingMethods: [],         // Phase 1: add for test compatibility
    selectedShippingMethod: null,  // Phase 1: add for test compatibility
    selectedPaymentMethod: null,   // Phase 1: add for test compatibility
    payment: { method: null, intent: null },
    form: { customer: { email: '', name: '', firstName: '', lastName: '', phone: '' }, address: { zip: '', city: '', line1: '' }, shipping: { address: '', city: '', postalCode: '', notes: '' }, terms_accepted: false },
    formErrors: {},              // Phase 1: add for validateForm
    completedOrder: null,        // Phase 1: add for processCheckout
    isLoading: false,            // Phase 1: add for loading state
    error: null,
    // actions
    loadCart: vi.fn(async () => ({ ok: true })),
    getShippingQuote: vi.fn(async () => ({ ok: true, methods: [] })),
    selectShipping: vi.fn(),
    selectShippingMethod: vi.fn(),
    selectPaymentMethod: vi.fn(),
    updateCustomerInfo: vi.fn(),
    updateShippingInfo: vi.fn(),
    setTermsAccepted: vi.fn(),   // Phase 1: add missing method
    validateForm: vi.fn(() => true),  // Phase 1: add missing method
    calculateOrderSummary: vi.fn(() => null),  // Phase 1: add missing method
    processCheckout: vi.fn(async () => ({ ok: true, orderId: 'test_123' })),  // Phase 1: add missing method
    reset: vi.fn(),
    validateCart: vi.fn(async () => ({ success: true, data: [] })),
    clearError: vi.fn(),
    clearErrors: vi.fn(),        // Phase 1: alias for clearError
  };
  return { ...defaults, ...partial };
}
