// Request ID helper for observability
// Pass 174Q — Quick-Wins Triad

import { randomBytes } from 'crypto';

/**
 * Get or generate request ID from headers
 * @param headers - Optional headers to extract existing request ID from
 * @returns Request ID (16-char hex string)
 */
export function getRequestId(headers?: Headers): string {
  // Try to get existing request ID from headers
  if (headers) {
    const existing = headers.get('x-request-id');
    if (existing) return existing;
  }

  // Generate new request ID
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
