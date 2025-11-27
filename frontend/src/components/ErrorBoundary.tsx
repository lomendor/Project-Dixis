'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { analytics } from '@/lib/analytics';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('🚨 Error Boundary Caught Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Track error with analytics
    this.trackError(error, errorInfo);

    // Forward to external error tracking service (Sentry, LogRocket, etc.)
    this.reportErrorToService(error, errorInfo);
  }

  private trackError(error: Error, errorInfo: ErrorInfo): void {
    try {
      // Create custom error tracking event
      analytics.track({
        event: 'error_boundary_triggered',
        timestamp: new Date().toISOString(),
        sessionId: analytics.getSessionId(),
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        data: {
          errorMessage: error.message,
          errorStack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      } as any);
    } catch (analyticsError) {
      console.warn('Failed to track error with analytics:', analyticsError);
    }
  }

  private async reportErrorToService(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      // In production, this would send to error monitoring service
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          }),
        });
      }
    } catch (reportingError) {
      console.warn('Failed to report error to external service:', reportingError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div data-testid="error-boundary" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div data-testid="error-page" className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ωχ! Κάτι πήγε στραβά
                </h2>
                <p className="text-gray-600 mb-6">
                  Λυπούμαστε, αλλά προέκυψε ένα απρόσμενο σφάλμα. Η ομάδα μας έχει ειδοποιηθεί και εργάζεται για την επίλυσή του.
                </p>

                {/* Error ID for Support */}
                {this.state.errorId && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-gray-600">
                      Κωδικός Σφάλματος: <span className="font-mono font-medium">{this.state.errorId}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Συμπεριλάβετε αυτόν τον κωδικό όταν επικοινωνείτε με την υποστήριξη
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    data-testid="error-retry-button"
                    onClick={this.handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Δοκιμάστε Ξανά
                  </button>

                  <button
                    onClick={this.handleReload}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Ανανέωση Σελίδας
                  </button>

                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Αρχική Σελίδα
                  </button>
                </div>

                {/* Developer Details */}
                {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                      Technical Details (Development)
                    </summary>
                    <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                      <div className="mb-2">
                        <strong>Error:</strong>
                        <pre className="mt-1 text-red-600">{this.state.error.message}</pre>
                      </div>
                      
                      {this.state.error.stack && (
                        <div className="mb-2">
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 text-gray-600 overflow-auto max-h-32">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 text-gray-600 overflow-auto max-h-32">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for easier usage
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: ReactNode,
  showDetails?: boolean
) {
  const WithErrorBoundaryComponent = (props: T) => (
    <ErrorBoundary fallback={fallback} showDetails={showDetails}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Hook for triggering test errors in development
export function useErrorBoundaryTest() {
  const triggerError = (message: string = 'Test error triggered manually') => {
    throw new Error(message);
  };

  return { triggerError };
}