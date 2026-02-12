/**
 * Shipping Quote Retry Logic with Exponential Backoff
 * Handles shipping quote API failures with intelligent retry and fallback mechanisms
 */

import { ShippingQuote, ShippingQuoteRequest } from '@/lib/api';
import { CheckoutHttpError, getErrorMessage } from './checkoutValidation';

// Retry configuration with exponential backoff
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  backoffMultiplier: 2,
  maxDelay: 8000 // 8 seconds max
};

// Shipping retry state for UI feedback
export interface ShippingRetryState {
  isLoading: boolean;
  currentAttempt: number;
  maxAttempts: number;
  error: CheckoutHttpError | null;
  lastAttemptTime: number;
  nextRetryIn: number;
}

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Calculate delay with exponential backoff
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Determine if error is retryable
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Network errors are always retryable
  if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    return true;
  }
  
  // HTTP errors
  if (error.message?.includes('HTTP')) {
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      // Retry on 429, 500, 502, 503, 504
      return [429, 500, 502, 503, 504].includes(status);
    }
  }
  
  return false;
};

// Parse HTTP error from API response
const parseHttpError = (error: any): CheckoutHttpError => {
  if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    return {
      type: 'NETWORK',
      message: 'Πρόβλημα σύνδεσης δικτύου',
      retryable: true
    };
  }
  
  if (error.message?.includes('HTTP')) {
    const statusMatch = error.message.match(/HTTP (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      
      switch (status) {
        case 422:
          return {
            type: '422',
            message: 'Μη έγκυρα στοιχεία αποστολής',
            retryable: false
          };
        case 429:
          return {
            type: '429',
            message: 'Πάρα πολλές αιτήσεις',
            retryable: true,
            retryAfter: 30
          };
        case 500:
          return {
            type: '500',
            message: 'Σφάλμα διακομιστή',
            retryable: true
          };
        case 502:
          return {
            type: '502',
            message: 'Διακομιστής μη διαθέσιμος',
            retryable: true
          };
        case 503:
          return {
            type: '503',
            message: 'Υπηρεσία προσωρινά μη διαθέσιμη',
            retryable: true
          };
        default:
          return {
            type: '500',
            message: `HTTP ${status} σφάλμα`,
            retryable: [429, 500, 502, 503, 504].includes(status)
          };
      }
    }
  }
  
  return {
    type: 'NETWORK',
    message: error.message || 'Άγνωστο σφάλμα',
    retryable: true
  };
};

// Enhanced shipping quote function with retry logic
export class ShippingRetryManager {
  private retryState: ShippingRetryState = {
    isLoading: false,
    currentAttempt: 0,
    maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
    error: null,
    lastAttemptTime: 0,
    nextRetryIn: 0
  };
  
  private retryConfig: RetryConfig;
  private listeners: ((state: ShippingRetryState) => void)[] = [];
  
  constructor(config: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.retryState.maxAttempts = this.retryConfig.maxAttempts;
  }
  
  // Subscribe to retry state changes
  onStateChange(listener: (state: ShippingRetryState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private updateState(updates: Partial<ShippingRetryState>): void {
    this.retryState = { ...this.retryState, ...updates };
    this.listeners.forEach(listener => listener(this.retryState));
  }
  
  // Get current retry state
  getState(): ShippingRetryState {
    return { ...this.retryState };
  }
  
  // Main shipping quote function with retry logic
  async getShippingQuoteWithRetry(
    apiCall: (data: ShippingQuoteRequest) => Promise<ShippingQuote>,
    request: ShippingQuoteRequest
  ): Promise<ShippingQuote | null> {
    const startTime = Date.now();

    this.updateState({
      isLoading: true,
      currentAttempt: 0,
      error: null,
      lastAttemptTime: startTime
    });
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        this.updateState({
          currentAttempt: attempt,
          lastAttemptTime: Date.now()
        });
        
        const result = await apiCall(request);
        
        this.updateState({
          isLoading: false,
          error: null
        });
        
        return result;
        
      } catch (error) {
        const httpError = parseHttpError(error);
        this.updateState({
          error: httpError,
          lastAttemptTime: Date.now()
        });
        
        // If not retryable or last attempt, fail
        if (!httpError.retryable || attempt === this.retryConfig.maxAttempts) {
          this.updateState({
            isLoading: false
          });
          return null;
        }
        
        // Calculate delay for next attempt
        const delay = calculateDelay(attempt, this.retryConfig);

        // Update retry countdown
        const countdownStart = Date.now();
        const countdownInterval = setInterval(() => {
          const elapsed = Date.now() - countdownStart;
          const remaining = Math.max(0, delay - elapsed);
          
          this.updateState({
            nextRetryIn: remaining
          });
          
          if (remaining <= 0) {
            clearInterval(countdownInterval);
          }
        }, 100);
        
        await sleep(delay);
        clearInterval(countdownInterval);
        
        this.updateState({
          nextRetryIn: 0
        });
      }
    }
    
    // Should not reach here, but safety fallback
    this.updateState({
      isLoading: false
    });
    
    return null;
  }
  
  // Fallback shipping calculation when API fails
  getFallbackShippingQuote(request: ShippingQuoteRequest): ShippingQuote {
    // Simple zone-based fallback pricing
    const postalPrefix = request.zip.substring(0, 2);
    let carrier = 'Ελληνικά Ταχυδρομεία';
    let cost = 5.50; // Default cost
    let etaDays = 3;
    let zone = 'Υπόλοιπη Ελλάδα';
    
    // Athens Metro
    if (['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'].includes(postalPrefix)) {
      carrier = 'Athens Express (Εκτίμηση)';
      cost = 4.50;
      etaDays = 1;
      zone = 'Αττική';
    }
    // Thessaloniki
    else if (['54', '55', '56', '57'].includes(postalPrefix)) {
      carrier = 'Northern Courier (Εκτίμηση)';
      cost = 5.50;
      etaDays = 2;
      zone = 'Θεσσαλονίκη';
    }
    // Islands (more expensive)
    else if (['81', '82', '83', '84', '85'].includes(postalPrefix)) {
      carrier = 'Island Logistics (Εκτίμηση)';
      cost = 8.50;
      etaDays = 4;
      zone = 'Νησιά';
    }
    
    const fallbackQuote: ShippingQuote = {
      carrier,
      cost,
      etaDays,
      zone,
      details: {
        zip: request.zip,
        city: request.city,
        weight: request.weight,
        volume: request.volume
      }
    };
    
    return fallbackQuote;
  }
  
  // Reset retry state
  reset(): void {
    this.retryState = {
      isLoading: false,
      currentAttempt: 0,
      maxAttempts: this.retryConfig.maxAttempts,
      error: null,
      lastAttemptTime: 0,
      nextRetryIn: 0
    };
    this.listeners.forEach(listener => listener(this.retryState));
  }
}

// Export singleton instance for global use
export const shippingRetryManager = new ShippingRetryManager();