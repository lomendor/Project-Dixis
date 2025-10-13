// Request ID helper for observability
// Pass 174Q — Quick-Wins Triad

import { randomBytes } from 'crypto';

export function getRequestId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Log with request ID for observability
 * @param rid - Request ID
 * @param msg - Log message
 * @param details - Optional additional details
 */
export function logWithId(rid: string, msg: string, details?: unknown): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    requestId: rid,
    message: msg,
    ...(details && { details }),
  };
  console.log(JSON.stringify(logEntry));
}
