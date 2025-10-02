import { setupServer } from 'msw/node';
import { generatedHandlers } from './handlers.generated';
import { handlersPruned } from './handlers.pruned';
import { handlersPrunedPass5 } from './handlers.pruned.pass5';
import { handlersPass102 } from './handlers.pass102';
import { handlersPass11 } from './handlers.pass11';
import { shippingQuoteHandlers } from '../msw/shipping.quote.handlers';

// Pruned handlers take priority (Pass12 shipping > Pass11 > Pass10.2 > Pass5 > pruned > generated)
export const server = setupServer(...shippingQuoteHandlers, ...handlersPass11, ...handlersPass102, ...handlersPrunedPass5, ...handlersPruned, ...generatedHandlers);
