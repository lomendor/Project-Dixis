/**
 * OBS-CHK-001 Implementation: Checkout Events & Traces
 * Implements event taxonomy from ADR-001 for checkout observability
 */

// Event taxonomy following ADR-001: dixis.<domain>.<action>[.<result>]
export enum CheckoutEventType {
  // Checkout lifecycle events
  CHECKOUT_STARTED = 'dixis.checkout.started',
  CHECKOUT_COMPLETED_SUCCESS = 'dixis.checkout.completed.success',
  CHECKOUT_COMPLETED_FAILURE = 'dixis.checkout.completed.failure',
  CHECKOUT_ABANDONED = 'dixis.checkout.abandoned',

  // Shipping events
  SHIPPING_QUOTE_REQUESTED = 'dixis.shipping.quote.requested',
  SHIPPING_QUOTE_RECEIVED = 'dixis.shipping.quote.received',
  SHIPPING_QUOTE_FAILED = 'dixis.shipping.quote.failed',
  SHIPPING_METHOD_SELECTED = 'dixis.shipping.method.selected',

  // Payment events
  PAYMENT_INITIATED = 'dixis.payment.initiated',
  PAYMENT_PROCESSING = 'dixis.payment.processing',
  PAYMENT_COMPLETED_SUCCESS = 'dixis.payment.completed.success',
  PAYMENT_COMPLETED_FAILURE = 'dixis.payment.completed.failure',

  // Cart events
  CART_LOADED = 'dixis.cart.loaded',
  CART_UPDATED = 'dixis.cart.updated',
  CART_VALIDATED = 'dixis.cart.validated',
  CART_VALIDATION_FAILED = 'dixis.cart.validation.failed',

  // Form events
  FORM_VALIDATED = 'dixis.form.validated',
  FORM_VALIDATION_FAILED = 'dixis.form.validation.failed',
  FORM_SUBMITTED = 'dixis.form.submitted'
}

// Event severity levels for observability
export enum EventSeverity {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Base event interface
interface BaseEvent {
  event_id: string;
  event_type: CheckoutEventType;
  timestamp: string;
  session_id?: string;
  user_id?: string;
  trace_id?: string;
  severity: EventSeverity;
  duration_ms?: number;
  context: Record<string, any>;
}

// Specific event payload types
interface CheckoutStartedEvent extends BaseEvent {
  event_type: CheckoutEventType.CHECKOUT_STARTED;
  context: {
    cart_item_count: number;
    cart_total_value: number;
    user_type: 'guest' | 'authenticated';
    source_page?: string;
  };
}

interface CheckoutCompletedEvent extends BaseEvent {
  event_type: CheckoutEventType.CHECKOUT_COMPLETED_SUCCESS | CheckoutEventType.CHECKOUT_COMPLETED_FAILURE;
  context: {
    order_id?: string;
    cart_total_value: number;
    shipping_cost: number;
    payment_method: string;
    shipping_method: string;
    failure_reason?: string;
    error_code?: string;
  };
}

interface ShippingQuoteEvent extends BaseEvent {
  event_type: CheckoutEventType.SHIPPING_QUOTE_REQUESTED | CheckoutEventType.SHIPPING_QUOTE_RECEIVED | CheckoutEventType.SHIPPING_QUOTE_FAILED;
  context: {
    postal_code: string;
    cart_weight?: number;
    quote_count?: number;
    cheapest_price?: number;
    fastest_days?: number;
    failure_reason?: string;
  };
}

interface PaymentEvent extends BaseEvent {
  event_type: CheckoutEventType.PAYMENT_INITIATED | CheckoutEventType.PAYMENT_PROCESSING | CheckoutEventType.PAYMENT_COMPLETED_SUCCESS | CheckoutEventType.PAYMENT_COMPLETED_FAILURE;
  context: {
    payment_method: string;
    amount: number;
    currency: string;
    gateway?: string;
    transaction_id?: string;
    failure_reason?: string;
    error_code?: string;
  };
}

// Event emitter interface
interface EventEmitter {
  emit(event: BaseEvent): void;
  setContext(key: string, value: any): void;
  startTrace(traceId: string): void;
  endTrace(): void;
}

// Trace context for correlation
interface TraceContext {
  trace_id: string;
  session_id?: string;
  user_id?: string;
  started_at: string;
  metadata: Record<string, any>;
}

// Main event tracker implementing OBS-CHK-001
export class CheckoutEventTracker implements EventEmitter {
  private static instance: CheckoutEventTracker;
  private context: Record<string, any> = {};
  private currentTrace?: TraceContext;
  private events: BaseEvent[] = [];

  private constructor() {
    // Initialize with session context
    this.context = {
      session_id: this.generateSessionId(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      timestamp_init: new Date().toISOString()
    };
  }

  static getInstance(): CheckoutEventTracker {
    if (!CheckoutEventTracker.instance) {
      CheckoutEventTracker.instance = new CheckoutEventTracker();
    }
    return CheckoutEventTracker.instance;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  setUserId(userId: string): void {
    this.context.user_id = userId;
  }

  startTrace(traceId?: string): void {
    this.currentTrace = {
      trace_id: traceId || `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: this.context.session_id,
      user_id: this.context.user_id,
      started_at: new Date().toISOString(),
      metadata: { ...this.context }
    };
  }

  endTrace(): void {
    if (this.currentTrace) {
      const duration = Date.now() - new Date(this.currentTrace.started_at).getTime();
      this.emit({
        event_id: this.generateEventId(),
        event_type: CheckoutEventType.CHECKOUT_COMPLETED_SUCCESS, // This would be determined by context
        timestamp: new Date().toISOString(),
        session_id: this.currentTrace.session_id,
        user_id: this.currentTrace.user_id,
        trace_id: this.currentTrace.trace_id,
        severity: EventSeverity.INFO,
        duration_ms: duration,
        context: { trace_completed: true }
      });
    }
    this.currentTrace = undefined;
  }

  emit(event: BaseEvent): void {
    // Add trace context if available
    if (this.currentTrace) {
      event.trace_id = this.currentTrace.trace_id;
      event.session_id = this.currentTrace.session_id;
      event.user_id = this.currentTrace.user_id;
    } else {
      event.session_id = this.context.session_id;
      event.user_id = this.context.user_id;
    }

    // Store event locally (in production, this would send to observability service)
    this.events.push(event);

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EVENT] ${event.event_type}`, event);
    }

    // Send to observability service (mock implementation)
    this.sendToObservabilityService(event);
  }

  private sendToObservabilityService(event: BaseEvent): void {
    // Mock implementation - in production this would integrate with
    // observability platforms like Datadog, New Relic, or custom telemetry
    if (typeof window !== 'undefined' && (window as any).__DIXIS_TELEMETRY__) {
      (window as any).__DIXIS_TELEMETRY__.push(event);
    }
  }

  // Convenience methods for checkout events
  trackCheckoutStarted(cartItemCount: number, cartTotalValue: number, userType: 'guest' | 'authenticated' = 'guest'): void {
    this.startTrace();
    this.emit({
      event_id: this.generateEventId(),
      event_type: CheckoutEventType.CHECKOUT_STARTED,
      timestamp: new Date().toISOString(),
      severity: EventSeverity.INFO,
      context: {
        cart_item_count: cartItemCount,
        cart_total_value: cartTotalValue,
        user_type: userType,
        source_page: typeof window !== 'undefined' ? window.location.pathname : undefined
      }
    });
  }

  trackCheckoutCompleted(success: boolean, context: Partial<CheckoutCompletedEvent['context']>): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: success ? CheckoutEventType.CHECKOUT_COMPLETED_SUCCESS : CheckoutEventType.CHECKOUT_COMPLETED_FAILURE,
      timestamp: new Date().toISOString(),
      severity: success ? EventSeverity.INFO : EventSeverity.ERROR,
      context: context as CheckoutCompletedEvent['context']
    });
    this.endTrace();
  }

  trackShippingQuoteRequested(postalCode: string, cartWeight?: number): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: CheckoutEventType.SHIPPING_QUOTE_REQUESTED,
      timestamp: new Date().toISOString(),
      severity: EventSeverity.INFO,
      context: {
        postal_code: postalCode,
        cart_weight: cartWeight
      }
    });
  }

  trackShippingQuoteReceived(postalCode: string, quoteCount: number, cheapestPrice: number, fastestDays: number): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: CheckoutEventType.SHIPPING_QUOTE_RECEIVED,
      timestamp: new Date().toISOString(),
      severity: EventSeverity.INFO,
      context: {
        postal_code: postalCode,
        quote_count: quoteCount,
        cheapest_price: cheapestPrice,
        fastest_days: fastestDays
      }
    });
  }

  trackShippingQuoteFailed(postalCode: string, failureReason: string): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: CheckoutEventType.SHIPPING_QUOTE_FAILED,
      timestamp: new Date().toISOString(),
      severity: EventSeverity.ERROR,
      context: {
        postal_code: postalCode,
        failure_reason: failureReason
      }
    });
  }

  trackPaymentInitiated(paymentMethod: string, amount: number, currency: string = 'EUR'): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: CheckoutEventType.PAYMENT_INITIATED,
      timestamp: new Date().toISOString(),
      severity: EventSeverity.INFO,
      context: {
        payment_method: paymentMethod,
        amount: amount,
        currency: currency
      }
    });
  }

  trackPaymentCompleted(success: boolean, context: Partial<PaymentEvent['context']>): void {
    this.emit({
      event_id: this.generateEventId(),
      event_type: success ? CheckoutEventType.PAYMENT_COMPLETED_SUCCESS : CheckoutEventType.PAYMENT_COMPLETED_FAILURE,
      timestamp: new Date().toISOString(),
      severity: success ? EventSeverity.INFO : EventSeverity.ERROR,
      context: context as PaymentEvent['context']
    });
  }

  // Analytics methods for business intelligence
  getEvents(): BaseEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: CheckoutEventType): BaseEvent[] {
    return this.events.filter(event => event.event_type === eventType);
  }

  getEventsByTrace(traceId: string): BaseEvent[] {
    return this.events.filter(event => event.trace_id === traceId);
  }

  clearEvents(): void {
    this.events = [];
  }

  // Performance monitoring
  measureCheckoutFunnel(): { [key in CheckoutEventType]?: number } {
    const funnelCounts: { [key in CheckoutEventType]?: number } = {};

    for (const event of this.events) {
      funnelCounts[event.event_type] = (funnelCounts[event.event_type] || 0) + 1;
    }

    return funnelCounts;
  }

  calculateConversionRate(): number {
    const started = this.getEventsByType(CheckoutEventType.CHECKOUT_STARTED).length;
    const completed = this.getEventsByType(CheckoutEventType.CHECKOUT_COMPLETED_SUCCESS).length;

    return started > 0 ? (completed / started) * 100 : 0;
  }
}

// Singleton instance for easy access
export const checkoutTracker = CheckoutEventTracker.getInstance();

// React hook for tracking
export const useCheckoutTracking = () => {
  return {
    trackCheckoutStarted: checkoutTracker.trackCheckoutStarted.bind(checkoutTracker),
    trackCheckoutCompleted: checkoutTracker.trackCheckoutCompleted.bind(checkoutTracker),
    trackShippingQuoteRequested: checkoutTracker.trackShippingQuoteRequested.bind(checkoutTracker),
    trackShippingQuoteReceived: checkoutTracker.trackShippingQuoteReceived.bind(checkoutTracker),
    trackShippingQuoteFailed: checkoutTracker.trackShippingQuoteFailed.bind(checkoutTracker),
    trackPaymentInitiated: checkoutTracker.trackPaymentInitiated.bind(checkoutTracker),
    trackPaymentCompleted: checkoutTracker.trackPaymentCompleted.bind(checkoutTracker),
    setUserId: checkoutTracker.setUserId.bind(checkoutTracker),
    setContext: checkoutTracker.setContext.bind(checkoutTracker),
    startTrace: checkoutTracker.startTrace.bind(checkoutTracker),
    endTrace: checkoutTracker.endTrace.bind(checkoutTracker)
  };
};

// Export types for external use
export type { BaseEvent, CheckoutStartedEvent, CheckoutCompletedEvent, ShippingQuoteEvent, PaymentEvent, TraceContext };