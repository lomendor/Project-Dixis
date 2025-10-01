/**
 * Test helper for canonical error assertions
 * Uses errors from @/lib/errors (ADR-002 compliant)
 */
import { AppError, AppErrorCode } from '@/lib/errors';

export { AppError, AppErrorCode };

// Helper to create AppError instances for testing
export function createAppError(code: AppErrorCode, context?: Record<string, any>): AppError {
  return new AppError(code, context);
}

// Helper to get the canonical user message for an error code
export function getCanonicalMessage(code: AppErrorCode): string {
  return new AppError(code).userMessage;
}

// Retry configuration from checkout.ts
export const DEFAULT_RETRIES = 2;
export const DEFAULT_TIMEOUT_MS = 30000;
