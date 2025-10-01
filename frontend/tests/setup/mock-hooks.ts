import { vi } from 'vitest';
import { makeUseCheckoutMock } from '../helpers/mock-useCheckout';

// Global mock for useCheckout hook to prevent null method errors in component tests
vi.mock('@/hooks/useCheckout', () => {
  return {
    useCheckout: () => makeUseCheckoutMock(),
  };
});
