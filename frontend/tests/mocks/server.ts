import { setupServer } from 'msw/node';
import { generatedHandlers } from './handlers.generated';
import { handlersPruned } from './handlers.pruned';

// Pruned handlers take priority (they come first)
export const server = setupServer(...handlersPruned, ...generatedHandlers);
