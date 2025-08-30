// Analytics & Event Tracking System for Project Dixis

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string | number;
  sessionId: string;
  page: string;
  data?: Record<string, any>;
  userAgent?: string;
}

export interface PageViewEvent extends AnalyticsEvent {
  event: 'page_view';
  data: {
    path: string;
    title: string;
    referrer?: string;
  };
}

export interface AddToCartEvent extends AnalyticsEvent {
  event: 'add_to_cart';
  data: {
    productId: number;
    productName: string;
    quantity: number;
    price: string;
    category?: string;
  };
}

export interface CheckoutStartEvent extends AnalyticsEvent {
  event: 'checkout_start';
  data: {
    cartValue: string;
    itemCount: number;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: string;
    }>;
  };
}

export interface OrderCompleteEvent extends AnalyticsEvent {
  event: 'order_complete';
  data: {
    orderId: number;
    orderValue: string;
    paymentMethod?: string;
    shippingMethod?: string;
    itemCount: number;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: string;
    }>;
  };
}

export type TrackedEvent = PageViewEvent | AddToCartEvent | CheckoutStartEvent | OrderCompleteEvent;

class AnalyticsService {
  private sessionId: string;
  private events: TrackedEvent[] = [];
  private isEnabled: boolean = true;
  private userId?: string | number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
    
    // In development, log to console by default
    if (process.env.NODE_ENV === 'development') {
      this.enableConsoleLogging();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('dixis_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
    }
  }

  private persistEvents(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only last 100 events to prevent storage bloat
      const eventsToStore = this.events.slice(-100);
      localStorage.setItem('dixis_analytics_events', JSON.stringify(eventsToStore));
    } catch (error) {
      console.warn('Failed to persist analytics events:', error);
    }
  }

  public setUserId(userId: string | number): void {
    this.userId = userId;
  }

  public enableConsoleLogging(): void {
    // Override track method to include console logging
    const originalTrack = this.track.bind(this);
    this.track = (event: TrackedEvent) => {
      console.log('📊 Analytics Event:', {
        event: event.event,
        page: event.page,
        data: event.data,
        timestamp: event.timestamp,
        userId: event.userId,
        sessionId: event.sessionId
      });
      return originalTrack(event);
    };
  }

  public track(event: TrackedEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent: TrackedEvent = {
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    this.events.push(enrichedEvent);
    this.persistEvents();

    // Forward to external analytics if configured
    this.forwardToExternalServices(enrichedEvent);
  }

  private async forwardToExternalServices(event: TrackedEvent): Promise<void> {
    // Placeholder for external analytics services (Google Analytics, Mixpanel, etc.)
    // In production, this would send to your analytics backend
    
    try {
      // Example: Send to backend analytics endpoint
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.warn('Failed to forward analytics event:', error);
    }
  }

  // Convenience methods for common events
  public trackPageView(path: string, title: string, referrer?: string): void {
    const event: PageViewEvent = {
      event: 'page_view',
      timestamp: '',
      sessionId: this.sessionId,
      page: path,
      data: {
        path,
        title,
        referrer: referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      },
    };
    this.track(event);
  }

  public trackAddToCart(productId: number, productName: string, quantity: number, price: string, category?: string): void {
    const event: AddToCartEvent = {
      event: 'add_to_cart',
      timestamp: '',
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      data: {
        productId,
        productName,
        quantity,
        price,
        category,
      },
    };
    this.track(event);
  }

  public trackCheckoutStart(cartValue: string, itemCount: number, items: Array<{ productId: number; productName: string; quantity: number; price: string }>): void {
    const event: CheckoutStartEvent = {
      event: 'checkout_start',
      timestamp: '',
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      data: {
        cartValue,
        itemCount,
        items,
      },
    };
    this.track(event);
  }

  public trackOrderComplete(
    orderId: number, 
    orderValue: string, 
    itemCount: number, 
    items: Array<{ productId: number; productName: string; quantity: number; price: string }>,
    paymentMethod?: string,
    shippingMethod?: string
  ): void {
    const event: OrderCompleteEvent = {
      event: 'order_complete',
      timestamp: '',
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      data: {
        orderId,
        orderValue,
        paymentMethod,
        shippingMethod,
        itemCount,
        items,
      },
    };
    this.track(event);
  }

  // Admin/debug methods
  public getEvents(): TrackedEvent[] {
    return [...this.events];
  }

  public getEventsByType(eventType: string): TrackedEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  public clearEvents(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dixis_analytics_events');
    }
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Export events for debugging/testing
  public exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackCheckoutStart: analytics.trackCheckoutStart.bind(analytics),
    trackOrderComplete: analytics.trackOrderComplete.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getEvents: analytics.getEvents.bind(analytics),
    getSessionId: analytics.getSessionId.bind(analytics),
    clearEvents: analytics.clearEvents.bind(analytics),
  };
}