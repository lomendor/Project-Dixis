// Request ID helper for observability
// Pass 174Q — Quick-Wins Triad

import { randomBytes } from 'crypto';

export function getRequestId(): string {
  return randomBytes(8).toString('hex');
}
