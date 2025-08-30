/**
 * Error Boundary Utilities
 * Helper functions and utilities for error boundary components
 */

import { ReactNode } from 'react';

/**
 * Error information interface for error boundaries
 */
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

/**
 * Enhanced error information for better debugging
 */
export interface EnhancedErrorInfo extends ErrorInfo {
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  errorId: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error category types
 */
export enum ErrorCategory {
  NETWORK = 'network',
  RENDERING = 'rendering',
  ASYNC = 'async',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

/**
 * Structured error report for logging and debugging
 */
export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: EnhancedErrorInfo;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: Record<string, unknown>;
  userInfo?: {
    id?: string;
    email?: string;
    role?: string;
  };
  metadata: {
    buildVersion?: string;
    commitHash?: string;
    environment: string;
    feature?: string;
  };
}

/**
 * Error boundary configuration options
 */
export interface ErrorBoundaryOptions {
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: EnhancedErrorInfo) => void;
  enableReporting?: boolean;
  reportingEndpoint?: string;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  isolateChildren?: boolean;
}

/**
 * Generates a unique error ID for tracking
 */
export function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `err_${timestamp}_${random}`;
}

/**
 * Creates enhanced error information with additional context
 */
export function createEnhancedErrorInfo(
  errorInfo: ErrorInfo,
  additionalContext?: Record<string, unknown>
): EnhancedErrorInfo {
  return {
    ...errorInfo,
    timestamp: new Date(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    errorId: generateErrorId(),
    userId: additionalContext?.userId as string | undefined,
    sessionId: additionalContext?.sessionId as string | undefined,
    buildVersion: (additionalContext?.buildVersion as string | undefined) || process.env.NEXT_PUBLIC_BUILD_VERSION,
  };
}

/**
 * Categorizes errors based on their type and message
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Network errors
  if (typeof message === 'string' && (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('cors') ||
    message.includes('timeout') ||
    message.includes('connection')
  )) {
    return ErrorCategory.NETWORK;
  }

  // Rendering errors
  if (
    message.includes('render') ||
    message.includes('component') ||
    message.includes('hook') ||
    message.includes('react') ||
    stack.includes('at render') ||
    stack.includes('at component')
  ) {
    return ErrorCategory.RENDERING;
  }

  // Async/Promise errors
  if (
    message.includes('promise') ||
    message.includes('async') ||
    message.includes('unhandled') ||
    stack.includes('async') ||
    stack.includes('promise'))
  ) {
    return ErrorCategory.ASYNC;
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format') ||
    message.includes('type error')
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('access denied')
  ) {
    return ErrorCategory.PERMISSION;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Determines error severity based on error type and context
 */
export function determineErrorSeverity(
  error: Error,
  category: ErrorCategory,
  context?: Record<string, unknown>
): ErrorSeverity {
  // Critical errors that break the entire app
  if (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Loading CSS chunk')
  ) {
    return ErrorSeverity.CRITICAL;
  }

  // Network errors are usually high severity
  if (category === ErrorCategory.NETWORK) {
    return ErrorSeverity.HIGH;
  }

  // Permission errors are medium to high
  if (category === ErrorCategory.PERMISSION) {
    return ErrorSeverity.MEDIUM;
  }

  // Rendering errors depend on context
  if (category === ErrorCategory.RENDERING) {
    // If it's in a critical component, it's high severity
    if (context?.componentName?.includes('Layout') || context?.critical) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.MEDIUM;
  }

  // Validation errors are usually low to medium
  if (category === ErrorCategory.VALIDATION) {
    return ErrorSeverity.LOW;
  }

  // Default to medium for unknown errors
  return ErrorSeverity.MEDIUM;
}

/**
 * Creates a comprehensive error report
 */
export function createErrorReport(
  error: Error,
  errorInfo: ErrorInfo,
  context?: Record<string, unknown>
): ErrorReport {
  const enhancedErrorInfo = createEnhancedErrorInfo(errorInfo, context);
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category, context);

  return {
    id: enhancedErrorInfo.errorId,
    timestamp: enhancedErrorInfo.timestamp,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    errorInfo: enhancedErrorInfo,
    severity,
    category,
    context: context || {},
    userInfo: context?.user,
    metadata: {
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
      commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
      environment: process.env.NODE_ENV || 'unknown',
      feature: context?.feature as string | undefined,
    },
  };
}

/**
 * Reports error to external service (logging, monitoring, etc.)
 */
export async function reportError(
  errorReport: ErrorReport,
  endpoint?: string
): Promise<void> {
  try {
    // Don't report errors in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_DEV_REPORTING) {
      console.group('🚨 Error Report (Development)');
      console.error('Error:', errorReport.error);
      console.error('Error Info:', errorReport.errorInfo);
      console.error('Context:', errorReport.context);
      console.groupEnd();
      return;
    }

    // Log to console for debugging
    console.error('Error Report:', errorReport);

    // Send to external service if endpoint is provided
    if (endpoint) {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    }

    // You can integrate with services like Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as { Sentry?: unknown }).Sentry) {
      ((window as { Sentry?: { captureException: (report: ErrorReport) => void } }).Sentry?.captureException)?.(errorReport);
    }

  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
}

/**
 * Error boundary state management utilities
 */
export class ErrorBoundaryState {
  private retryCount = 0;
  private lastError: Error | null = null;
  private maxRetries: number;

  constructor(maxRetries: number = 3) {
    this.maxRetries = maxRetries;
  }

  hasError(): boolean {
    return this.lastError !== null;
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  setError(error: Error): void {
    this.lastError = error;
  }

  retry(): void {
    if (this.canRetry()) {
      this.retryCount++;
      this.lastError = null;
    }
  }

  reset(): void {
    this.retryCount = 0;
    this.lastError = null;
  }
}

/**
 * Creates user-friendly error messages based on error type
 */
export function getUserFriendlyErrorMessage(
  error: Error,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): string {
  const defaultMessages = {
    [ErrorCategory.NETWORK]: 'Κάτι πήγε στραβά με τη σύνδεσή σας. Παρακαλώ δοκιμάστε ξανά.',
    [ErrorCategory.RENDERING]: 'Προέκυψε ένα πρόβλημα με την εμφάνιση της σελίδας.',
    [ErrorCategory.ASYNC]: 'Κάτι πήγε στραβά κατά την επεξεργασία των δεδομένων.',
    [ErrorCategory.VALIDATION]: 'Τα δεδομένα που εισάγατε δεν είναι έγκυρα.',
    [ErrorCategory.PERMISSION]: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτό το περιεχόμενο.',
    [ErrorCategory.UNKNOWN]: 'Προέκυψε ένα απροσδόκητο πρόβλημα.',
  };

  // Check for specific error types
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return 'Η εφαρμογή ενημερώθηκε. Παρακαλώ ανανεώστε τη σελίδα.';
  }

  if (error.message.includes('Network Error') || error.message.includes('failed to fetch')) {
    return 'Πρόβλημα δικτύου. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
  }

  return defaultMessages[category];
}

/**
 * Checks if an error is recoverable (can be retried)
 */
export function isRecoverableError(error: Error): boolean {
  const recoverablePatterns = [
    'Network Error',
    'failed to fetch',
    'timeout',
    'Loading chunk',
    'ChunkLoadError',
  ];

  return recoverablePatterns.some(pattern =>
    error.message.includes(pattern) || error.name.includes(pattern)
  );
}

/**
 * Development helper to simulate errors for testing
 */
export function simulateError(
  type: 'sync' | 'async' | 'component' = 'sync',
  message: string = 'Simulated error'
): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('simulateError should only be used in development');
    return;
  }

  switch (type) {
    case 'sync':
      throw new Error(message);
    
    case 'async':
      setTimeout(() => {
        throw new Error(message);
      }, 100);
      break;
    
    case 'component':
      // This would typically be used inside a component
      console.error('Component error simulation:', message);
      break;
  }
}

/**
 * Hook helper for component-level error handling
 */
export function createErrorHandler(
  componentName: string,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return {
    handleError: (error: Error, errorInfo: ErrorInfo) => {
      const context = { componentName, critical: false };
      const errorReport = createErrorReport(error, errorInfo, context);
      
      // Report error
      reportError(errorReport);
      
      // Call custom error handler if provided
      if (onError) {
        onError(error, errorInfo);
      }
    },
    
    wrapAsync: <T>(asyncFn: () => Promise<T>) => {
      return async (): Promise<T | null> => {
        try {
          return await asyncFn();
        } catch (error) {
          if (error instanceof Error) {
            const errorInfo: ErrorInfo = {
              componentStack: componentName,
            };
            const context = { componentName, critical: false };
            const errorReport = createErrorReport(error, errorInfo, context);
            await reportError(errorReport);
          }
          return null;
        }
      };
    },
  };
}