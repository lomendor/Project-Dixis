/**
 * ADR-002 Implementation: AppError with typed error codes
 * Provides typed errors with user-safe messages and observability codes
 */

// Error categories as per ADR-002
export enum ErrorCategory {
  CHECKOUT = 'CHECKOUT',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION'
}

// Error severity levels for observability
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Typed error codes as specified in ADR-002
export enum AppErrorCode {
  // Checkout errors
  CHECKOUT_RATE_UNAVAILABLE = 'CHECKOUT_RATE_UNAVAILABLE',
  CHECKOUT_CART_EMPTY = 'CHECKOUT_CART_EMPTY',
  CHECKOUT_INVALID_ADDRESS = 'CHECKOUT_INVALID_ADDRESS',
  CHECKOUT_SHIPPING_FAILED = 'CHECKOUT_SHIPPING_FAILED',

  // Payment errors
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_INSUFFICIENT_FUNDS = 'PAYMENT_INSUFFICIENT_FUNDS',
  PAYMENT_CARD_EXPIRED = 'PAYMENT_CARD_EXPIRED',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',

  // Shipping errors
  SHIPPING_ZONE_UNSUPPORTED = 'SHIPPING_ZONE_UNSUPPORTED',
  SHIPPING_WEIGHT_EXCEEDED = 'SHIPPING_WEIGHT_EXCEEDED',
  SHIPPING_ADDRESS_INVALID = 'SHIPPING_ADDRESS_INVALID',

  // Auth errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_FAILED = 'NETWORK_CONNECTION_FAILED',
  NETWORK_SERVER_ERROR = 'NETWORK_SERVER_ERROR',

  // Validation errors
  VALIDATION_POSTAL_CODE = 'VALIDATION_POSTAL_CODE',
  VALIDATION_EMAIL_FORMAT = 'VALIDATION_EMAIL_FORMAT',
  VALIDATION_PHONE_FORMAT = 'VALIDATION_PHONE_FORMAT'
}

// User-safe message mapping (Greek)
const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  // Checkout
  [AppErrorCode.CHECKOUT_RATE_UNAVAILABLE]: 'Δεν είναι διαθέσιμες μέθοδοι αποστολής για την περιοχή σας',
  [AppErrorCode.CHECKOUT_CART_EMPTY]: 'Το καλάθι σας είναι άδειο',
  [AppErrorCode.CHECKOUT_INVALID_ADDRESS]: 'Παρακαλώ ελέγξτε τη διεύθυνση αποστολής',
  [AppErrorCode.CHECKOUT_SHIPPING_FAILED]: 'Σφάλμα στον υπολογισμό αποστολής',

  // Payment
  [AppErrorCode.PAYMENT_DECLINED]: 'Η πληρωμή απορρίφθηκε. Παρακαλώ δοκιμάστε άλλη κάρτα',
  [AppErrorCode.PAYMENT_INSUFFICIENT_FUNDS]: 'Ανεπαρκή κεφάλαια στην κάρτα',
  [AppErrorCode.PAYMENT_CARD_EXPIRED]: 'Η κάρτα σας έχει λήξει',
  [AppErrorCode.PAYMENT_GATEWAY_ERROR]: 'Προσωρινό πρόβλημα πληρωμής. Δοκιμάστε ξανά',

  // Shipping
  [AppErrorCode.SHIPPING_ZONE_UNSUPPORTED]: 'Δεν παραδίδουμε στην περιοχή σας',
  [AppErrorCode.SHIPPING_WEIGHT_EXCEEDED]: 'Το βάρος της παραγγελίας υπερβαίνει το όριο',
  [AppErrorCode.SHIPPING_ADDRESS_INVALID]: 'Μη έγκυρη διεύθυνση παράδοσης',

  // Auth
  [AppErrorCode.AUTH_INVALID_CREDENTIALS]: 'Λανθασμένα στοιχεία σύνδεσης',
  [AppErrorCode.AUTH_SESSION_EXPIRED]: 'Η συνεδρία σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά',
  [AppErrorCode.AUTH_PERMISSION_DENIED]: 'Δεν έχετε δικαίωμα πρόσβασης',

  // Network
  [AppErrorCode.NETWORK_TIMEOUT]: 'Το αίτημα έληξε. Ελέγξτε τη σύνδεσή σας',
  [AppErrorCode.NETWORK_CONNECTION_FAILED]: 'Πρόβλημα σύνδεσης. Δοκιμάστε ξανά',
  [AppErrorCode.NETWORK_SERVER_ERROR]: 'Προσωρινό πρόβλημα διακομιστή. Δοκιμάστε ξανά',

  // Validation
  [AppErrorCode.VALIDATION_POSTAL_CODE]: 'Μη έγκυρος ταχυδρομικός κώδικας (5 ψηφία)',
  [AppErrorCode.VALIDATION_EMAIL_FORMAT]: 'Μη έγκυρη διεύθυνση email',
  [AppErrorCode.VALIDATION_PHONE_FORMAT]: 'Μη έγκυρος αριθμός τηλεφώνου'
};

// Error severity mapping for observability
const ERROR_SEVERITY: Record<AppErrorCode, ErrorSeverity> = {
  // High severity - affect core business flows
  [AppErrorCode.CHECKOUT_RATE_UNAVAILABLE]: ErrorSeverity.HIGH,
  [AppErrorCode.PAYMENT_DECLINED]: ErrorSeverity.HIGH,
  [AppErrorCode.PAYMENT_GATEWAY_ERROR]: ErrorSeverity.HIGH,

  // Medium severity - affect user experience
  [AppErrorCode.CHECKOUT_SHIPPING_FAILED]: ErrorSeverity.MEDIUM,
  [AppErrorCode.SHIPPING_ZONE_UNSUPPORTED]: ErrorSeverity.MEDIUM,
  [AppErrorCode.AUTH_SESSION_EXPIRED]: ErrorSeverity.MEDIUM,
  [AppErrorCode.NETWORK_TIMEOUT]: ErrorSeverity.MEDIUM,

  // Low severity - validation errors
  [AppErrorCode.CHECKOUT_CART_EMPTY]: ErrorSeverity.LOW,
  [AppErrorCode.VALIDATION_POSTAL_CODE]: ErrorSeverity.LOW,
  [AppErrorCode.VALIDATION_EMAIL_FORMAT]: ErrorSeverity.LOW,
  [AppErrorCode.VALIDATION_PHONE_FORMAT]: ErrorSeverity.LOW,

  // Critical severity - system failures
  [AppErrorCode.NETWORK_SERVER_ERROR]: ErrorSeverity.CRITICAL,
  [AppErrorCode.AUTH_PERMISSION_DENIED]: ErrorSeverity.CRITICAL,

  // Other errors - medium by default
  [AppErrorCode.CHECKOUT_INVALID_ADDRESS]: ErrorSeverity.MEDIUM,
  [AppErrorCode.PAYMENT_INSUFFICIENT_FUNDS]: ErrorSeverity.MEDIUM,
  [AppErrorCode.PAYMENT_CARD_EXPIRED]: ErrorSeverity.MEDIUM,
  [AppErrorCode.SHIPPING_WEIGHT_EXCEEDED]: ErrorSeverity.MEDIUM,
  [AppErrorCode.SHIPPING_ADDRESS_INVALID]: ErrorSeverity.MEDIUM,
  [AppErrorCode.AUTH_INVALID_CREDENTIALS]: ErrorSeverity.MEDIUM,
  [AppErrorCode.NETWORK_CONNECTION_FAILED]: ErrorSeverity.MEDIUM
};

// HTTP status code mapping for API responses
const ERROR_HTTP_STATUS: Record<AppErrorCode, number> = {
  // 400 Bad Request - Client errors
  [AppErrorCode.CHECKOUT_CART_EMPTY]: 400,
  [AppErrorCode.CHECKOUT_INVALID_ADDRESS]: 400,
  [AppErrorCode.VALIDATION_POSTAL_CODE]: 400,
  [AppErrorCode.VALIDATION_EMAIL_FORMAT]: 400,
  [AppErrorCode.VALIDATION_PHONE_FORMAT]: 400,
  [AppErrorCode.SHIPPING_ADDRESS_INVALID]: 400,
  [AppErrorCode.SHIPPING_WEIGHT_EXCEEDED]: 400,

  // 401 Unauthorized
  [AppErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [AppErrorCode.AUTH_SESSION_EXPIRED]: 401,

  // 403 Forbidden
  [AppErrorCode.AUTH_PERMISSION_DENIED]: 403,

  // 402 Payment Required
  [AppErrorCode.PAYMENT_DECLINED]: 402,
  [AppErrorCode.PAYMENT_INSUFFICIENT_FUNDS]: 402,
  [AppErrorCode.PAYMENT_CARD_EXPIRED]: 402,

  // 404 Not Found / 422 Unprocessable Entity
  [AppErrorCode.SHIPPING_ZONE_UNSUPPORTED]: 422,

  // 500 Internal Server Error
  [AppErrorCode.CHECKOUT_RATE_UNAVAILABLE]: 500,
  [AppErrorCode.CHECKOUT_SHIPPING_FAILED]: 500,
  [AppErrorCode.PAYMENT_GATEWAY_ERROR]: 500,
  [AppErrorCode.NETWORK_SERVER_ERROR]: 500,

  // 503 Service Unavailable / 408 Timeout
  [AppErrorCode.NETWORK_TIMEOUT]: 408,
  [AppErrorCode.NETWORK_CONNECTION_FAILED]: 503
};

// Retry configuration for different error types
interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  exponential: boolean;
}

const ERROR_RETRY_CONFIG: Partial<Record<AppErrorCode, RetryConfig>> = {
  [AppErrorCode.NETWORK_TIMEOUT]: { maxRetries: 3, backoffMs: 1000, exponential: true },
  [AppErrorCode.NETWORK_CONNECTION_FAILED]: { maxRetries: 3, backoffMs: 2000, exponential: true },
  [AppErrorCode.NETWORK_SERVER_ERROR]: { maxRetries: 2, backoffMs: 3000, exponential: true },
  [AppErrorCode.CHECKOUT_RATE_UNAVAILABLE]: { maxRetries: 2, backoffMs: 1500, exponential: false },
  [AppErrorCode.PAYMENT_GATEWAY_ERROR]: { maxRetries: 1, backoffMs: 5000, exponential: false }
};

// Main AppError class implementing ADR-002
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly httpStatus: number;
  public readonly retryConfig?: RetryConfig;
  public readonly timestamp: string;
  public readonly context?: Record<string, any>;

  constructor(
    code: AppErrorCode,
    context?: Record<string, any>,
    cause?: Error
  ) {
    const userMessage = ERROR_MESSAGES[code];
    super(userMessage);

    this.name = 'AppError';
    this.code = code;
    this.category = this.extractCategory(code);
    this.severity = ERROR_SEVERITY[code];
    this.userMessage = userMessage;
    this.httpStatus = ERROR_HTTP_STATUS[code];
    this.retryConfig = ERROR_RETRY_CONFIG[code];
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.cause = cause;

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private extractCategory(code: AppErrorCode): ErrorCategory {
    const prefix = code.split('_')[0];
    return ErrorCategory[prefix as keyof typeof ErrorCategory] || ErrorCategory.NETWORK;
  }

  // Serialize for logging/observability
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }

  // Check if error is retryable
  isRetryable(): boolean {
    return !!this.retryConfig;
  }

  // Get retry configuration
  getRetryConfig(): RetryConfig | null {
    return this.retryConfig || null;
  }
}

// Factory functions for common errors
export const ErrorFactory = {
  checkoutRateUnavailable: (postalCode?: string) =>
    new AppError(AppErrorCode.CHECKOUT_RATE_UNAVAILABLE, { postalCode }),

  paymentDeclined: (cardLast4?: string) =>
    new AppError(AppErrorCode.PAYMENT_DECLINED, { cardLast4 }),

  networkTimeout: (url?: string, timeoutMs?: number) =>
    new AppError(AppErrorCode.NETWORK_TIMEOUT, { url, timeoutMs }),

  validationError: (field: string, value?: any) => {
    switch (field) {
      case 'postal_code':
        return new AppError(AppErrorCode.VALIDATION_POSTAL_CODE, { field, value });
      case 'email':
        return new AppError(AppErrorCode.VALIDATION_EMAIL_FORMAT, { field, value });
      case 'phone':
        return new AppError(AppErrorCode.VALIDATION_PHONE_FORMAT, { field, value });
      default:
        return new AppError(AppErrorCode.VALIDATION_POSTAL_CODE, { field, value });
    }
  },

  fromHttpError: (status: number, message?: string, context?: Record<string, any>) => {
    switch (status) {
      case 401:
        return new AppError(AppErrorCode.AUTH_SESSION_EXPIRED, context);
      case 403:
        return new AppError(AppErrorCode.AUTH_PERMISSION_DENIED, context);
      case 408:
        return new AppError(AppErrorCode.NETWORK_TIMEOUT, context);
      case 500:
        return new AppError(AppErrorCode.NETWORK_SERVER_ERROR, context);
      case 503:
        return new AppError(AppErrorCode.NETWORK_CONNECTION_FAILED, context);
      default:
        return new AppError(AppErrorCode.NETWORK_SERVER_ERROR, { status, message, ...context });
    }
  }
};

// Error boundary helper for React components
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

// Export types for external use
export type { RetryConfig };