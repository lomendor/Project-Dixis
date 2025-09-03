/**
 * Error Handling Service
 * 
 * Comprehensive error handling with user-friendly messages,
 * i18n support, and contextual error reporting.
 */

import { env, isGreek } from '@lib/env';
import { ApiValidationError } from './api-service';
import { z } from 'zod';

/**
 * Error Context for better error messages
 */
export interface ErrorContext {
  operation: string;
  component?: string;
  user_action?: string;
  retry_possible?: boolean;
}

/**
 * Error Message Translations
 */
const errorMessages = {
  en: {
    // Authentication errors
    'Invalid credentials': 'The email or password you entered is incorrect.',
    'Email is required': 'Please enter your email address.',
    'Password is required': 'Please enter your password.',
    'Passwords do not match': 'The passwords you entered do not match.',
    'Email must be a valid email address': 'Please enter a valid email address.',
    'Password must be at least 8 characters long': 'Your password must be at least 8 characters long.',
    
    // Validation errors
    'Postal code must be exactly 5 digits': 'Please enter a valid 5-digit postal code.',
    'City name is required': 'Please enter your city name.',
    'Address must be at least 5 characters': 'Please enter a complete street address.',
    'Phone number format is invalid': 'Please enter a valid Greek phone number.',
    
    // Network errors
    'Network error': 'Unable to connect to the server. Please check your internet connection.',
    'Server error': 'The server is temporarily unavailable. Please try again later.',
    'Request timeout': 'The request took too long. Please try again.',
    
    // Business logic errors
    'Insufficient stock': 'This product is currently out of stock.',
    'Invalid shipping address': 'Please check your shipping address details.',
    'Payment processing failed': 'Payment could not be processed. Please try again.',
    'Order not found': 'The requested order could not be found.',
    
    // Generic fallbacks
    'Unknown error': 'An unexpected error occurred. Please try again.',
    'Validation failed': 'Please check the information you entered.',
  },
  el: {
    // Authentication errors
    'Invalid credentials': 'Το email ή ο κωδικός που εισάγατε είναι λάθος.',
    'Email is required': 'Παρακαλώ εισάγετε το email σας.',
    'Password is required': 'Παρακαλώ εισάγετε τον κωδικό σας.',
    'Passwords do not match': 'Οι κωδικοί που εισάγατε δεν ταιριάζουν.',
    'Email must be a valid email address': 'Παρακαλώ εισάγετε ένα έγκυρο email.',
    'Password must be at least 8 characters long': 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
    
    // Validation errors
    'Postal code must be exactly 5 digits': 'Παρακαλώ εισάγετε έναν έγκυρο ταχυδρομικό κώδικα 5 ψηφίων.',
    'City name is required': 'Παρακαλώ εισάγετε την πόλη σας.',
    'Address must be at least 5 characters': 'Παρακαλώ εισάγετε μια πλήρη διεύθυνση.',
    'Phone number format is invalid': 'Παρακαλώ εισάγετε έναν έγκυρο ελληνικό αριθμό τηλεφώνου.',
    
    // Network errors
    'Network error': 'Δεν είναι δυνατή η σύνδεση με τον server. Παρακαλώ ελέγξτε τη σύνδεσή σας.',
    'Server error': 'Ο server είναι προσωρινά μη διαθέσιμος. Παρακαλώ δοκιμάστε ξανά.',
    'Request timeout': 'Το αίτημα κράτησε πολύ. Παρακαλώ δοκιμάστε ξανά.',
    
    // Business logic errors
    'Insufficient stock': 'Αυτό το προϊόν έχει εξαντληθεί.',
    'Invalid shipping address': 'Παρακαλώ ελέγξτε τη διεύθυνση παράδοσης.',
    'Payment processing failed': 'Η πληρωμή δεν μπόρεσε να επεξεργαστεί. Παρακαλώ δοκιμάστε ξανά.',
    'Order not found': 'Η παραγγελία που ζητήσατε δεν βρέθηκε.',
    
    // Generic fallbacks
    'Unknown error': 'Προέκυψε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.',
    'Validation failed': 'Παρακαλώ ελέγξτε τις πληροφορίες που εισάγατε.',
  },
};

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Processed Error for UI consumption
 */
export interface ProcessedError {
  message: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  retry_possible: boolean;
  user_action?: string;
  technical_details?: string;
}

/**
 * Error Processing Service
 */
class ErrorService {
  private locale: 'en' | 'el' = 'en';

  constructor() {
    this.locale = isGreek ? 'el' : 'en';
  }

  /**
   * Process any error into a user-friendly format
   */
  processError(
    error: unknown,
    context?: ErrorContext
  ): ProcessedError {
    // Handle API validation errors
    if (error instanceof ApiValidationError) {
      return this.processApiError(error, context);
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return this.processZodError(error, context);
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      return this.processGenericError(error, context);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: this.translateMessage(error),
        severity: ErrorSeverity.ERROR,
        context,
        retry_possible: false,
      };
    }

    // Handle unknown errors
    return {
      message: this.translateMessage('Unknown error'),
      severity: ErrorSeverity.ERROR,
      context,
      retry_possible: true,
      technical_details: String(error),
    };
  }

  /**
   * Process API validation errors
   */
  private processApiError(
    error: ApiValidationError,
    context?: ErrorContext
  ): ProcessedError {
    let severity = ErrorSeverity.ERROR;
    let retryPossible = false;

    // Determine severity and retry possibility
    if (error.isServerError()) {
      severity = ErrorSeverity.CRITICAL;
      retryPossible = true;
    } else if (error.isAuthError()) {
      severity = ErrorSeverity.WARNING;
      retryPossible = false;
    } else if (error.isValidationError()) {
      severity = ErrorSeverity.INFO;
      retryPossible = false;
    }

    // Get user-friendly message
    const userMessage = this.translateMessage(error.getUserMessage());

    return {
      message: userMessage,
      severity,
      context,
      retry_possible: retryPossible,
      user_action: this.getUserAction(error, context),
      technical_details: env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  /**
   * Process Zod validation errors
   */
  private processZodError(
    error: z.ZodError,
    context?: ErrorContext
  ): ProcessedError {
    const fieldErrors = error.errors.map((err) => {
      return this.translateMessage(err.message);
    });

    return {
      message: fieldErrors.join('. '),
      severity: ErrorSeverity.INFO,
      context,
      retry_possible: false,
      user_action: 'Please correct the highlighted fields.',
    };
  }

  /**
   * Process generic Error objects
   */
  private processGenericError(
    error: Error,
    context?: ErrorContext
  ): ProcessedError {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: this.translateMessage('Network error'),
        severity: ErrorSeverity.ERROR,
        context,
        retry_possible: true,
        user_action: 'Please check your internet connection and try again.',
      };
    }

    // Check for timeout errors
    if (error.message.includes('timeout')) {
      return {
        message: this.translateMessage('Request timeout'),
        severity: ErrorSeverity.WARNING,
        context,
        retry_possible: true,
        user_action: 'Please try again.',
      };
    }

    // Default generic error handling
    return {
      message: this.translateMessage(error.message) || this.translateMessage('Unknown error'),
      severity: ErrorSeverity.ERROR,
      context,
      retry_possible: true,
      technical_details: env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  /**
   * Translate error message to current locale
   */
  private translateMessage(message: string): string {
    const translations = errorMessages[this.locale];
    
    // Direct match
    if (translations[message as keyof typeof translations]) {
      return translations[message as keyof typeof translations];
    }

    // Partial match (for dynamic content)
    for (const [key, translation] of Object.entries(translations)) {
      if (message.includes(key)) {
        return translation;
      }
    }

    // Fallback to original message
    return message;
  }

  /**
   * Get suggested user action based on error type
   */
  private getUserAction(error: ApiValidationError, _context?: ErrorContext): string {
    if (error.isAuthError()) {
      return this.locale === 'el' 
        ? 'Παρακαλώ συνδεθείτε ξανά.'
        : 'Please log in again.';
    }

    if (error.isServerError()) {
      return this.locale === 'el'
        ? 'Παρακαλώ δοκιμάστε ξανά σε λίγα λεπτά.'
        : 'Please try again in a few minutes.';
    }

    if (error.isValidationError()) {
      return this.locale === 'el'
        ? 'Παρακαλώ ελέγξτε τις πληροφορίες που εισάγατε.'
        : 'Please check the information you entered.';
    }

    return this.locale === 'el'
      ? 'Παρακαλώ δοκιμάστε ξανά.'
      : 'Please try again.';
  }

  /**
   * Log error for monitoring (production)
   */
  logError(error: ProcessedError): void {
    if (env.NODE_ENV === 'production') {
      // Send to monitoring service
      console.error('[Error Service]', {
        message: error.message,
        severity: error.severity,
        context: error.context,
        technical_details: error.technical_details,
        timestamp: new Date().toISOString(),
        locale: this.locale,
      });
    } else {
      // Development logging
      console.group(`[Error Service] ${error.severity.toUpperCase()}`);
      console.error('Message:', error.message);
      if (error.context) console.log('Context:', error.context);
      if (error.technical_details) console.log('Technical:', error.technical_details);
      console.groupEnd();
    }
  }
}

/**
 * Singleton error service
 */
export const errorService = new ErrorService();

/**
 * Utility function for quick error processing
 */
export const processError = (error: unknown, context?: ErrorContext): ProcessedError => {
  return errorService.processError(error, context);
};

/**
 * Utility function for form validation errors
 */
export const processFormError = (error: unknown, formName: string): ProcessedError => {
  return processError(error, {
    operation: 'form_validation',
    component: formName,
    user_action: 'form_submission',
    retry_possible: false,
  });
};

/**
 * Utility function for API call errors
 */
export const processApiCallError = (error: unknown, endpoint: string): ProcessedError => {
  return processError(error, {
    operation: 'api_call',
    component: endpoint,
    retry_possible: true,
  });
};