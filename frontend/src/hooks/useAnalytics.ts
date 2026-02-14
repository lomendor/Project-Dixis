import { useCallback, useRef, useEffect } from 'react';
import { 
  AnalyticsEvent, 
  validateEvent,
  createPageViewEvent,
  createAddToCartEvent,
  createCheckoutStartEvent,
  createOrderCompleteEvent
} from '@/lib/analytics/eventSchema';

// Session management
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('dixis_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('dixis_session_id', sessionId);
  }
  return sessionId;
};

// Event batching system
class EventBatcher {
  private events: AnalyticsEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT_MS = 5000;

  add(event: AnalyticsEvent) {
    try {
      const validatedEvent = validateEvent(event);
      this.events.push(validatedEvent);
      
      // Flush if batch is full or start timeout
      if (this.events.length >= this.BATCH_SIZE) {
        this.flush();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), this.BATCH_TIMEOUT_MS);
      }
    } catch {
      // Invalid event — silently drop
    }
  }

  flush() {
    if (this.events.length === 0) return;

    // TODO: Send to analytics endpoint when configured

    // Clear batch
    this.events = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  clear() {
    this.events = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export const useAnalytics = () => {
  const batcherRef = useRef<EventBatcher>(new EventBatcher());
  const sessionId = getSessionId();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      batcherRef.current.flush();
    };
  }, []);

  // Page view tracking
  const trackPageView = useCallback((
    page_path: string,
    page_title?: string,
    user_id?: string
  ) => {
    const event = createPageViewEvent(page_path, sessionId, page_title, user_id);
    batcherRef.current.add(event);
  }, [sessionId]);

  // Product interaction tracking
  const trackAddToCart = useCallback((
    product_id: number,
    product_name: string,
    price: number,
    quantity: number,
    user_id?: string
  ) => {
    const event = createAddToCartEvent(product_id, product_name, price, quantity, sessionId, user_id);
    batcherRef.current.add(event);
  }, [sessionId]);

  // Checkout flow tracking
  const trackCheckoutStart = useCallback((
    cart_value: number,
    item_count: number,
    user_id?: string
  ) => {
    const event = createCheckoutStartEvent(cart_value, item_count, sessionId, user_id);
    batcherRef.current.add(event);
  }, [sessionId]);

  // Order completion tracking
  const trackOrderComplete = useCallback((
    order_id: string,
    total_amount: number,
    item_count: number,
    payment_method: string,
    user_id?: string
  ) => {
    const event = createOrderCompleteEvent(order_id, total_amount, item_count, payment_method, sessionId, user_id);
    batcherRef.current.add(event);
  }, [sessionId]);

  // Manual flush for critical events
  const flush = useCallback(() => {
    batcherRef.current.flush();
  }, []);

  return {
    trackPageView,
    trackAddToCart,
    trackCheckoutStart,
    trackOrderComplete,
    flush,
    sessionId,
  };
};