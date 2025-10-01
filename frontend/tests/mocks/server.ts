import { setupServer } from 'msw/node';
import { generatedHandlers } from './handlers.generated';
import { handlersPruned } from './handlers.pruned';
import { handlersPrunedPass5 } from './handlers.pruned.pass5';

// Pruned handlers take priority (Pass5 > pruned > generated)
export const server = setupServer(...handlersPrunedPass5, ...handlersPruned, ...generatedHandlers);
