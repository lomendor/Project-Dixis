import { vi } from 'vitest';
import { makeUseCheckoutMock } from '../helpers/mock-useCheckout';
vi.mock('@/hooks/useCheckout', () => ({ useCheckout: () => makeUseCheckoutMock() }));
