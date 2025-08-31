// Advanced Analytics Engine - PP03-E Finalization
// Comprehensive event tracking with AI-powered insights

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'click' | 'search' | 'purchase' | 'error' | 'performance' | 'user_action';
  timestamp: number;
  user_id?: number;
  session_id: string;
  data: Record<string, any>;
  context: {
    url: string;
    user_agent: string;
    referrer?: string;
    device_type: 'mobile' | 'tablet' | 'desktop';
    viewport: { width: number; height: number };
    language: string;
  };
  performance?: {
    page_load_time?: number;
    ttfb?: number;
    fcp?: number;
    lcp?: number;
  };
}

export interface AnalyticsConfig {
  apiEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableConsoleLogging: boolean;
  privacyMode: boolean;
}

class AdvancedAnalyticsEngine {
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: number;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;
  private startTime: number;
  private isEnabled: boolean = true;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      privacyMode: false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    this.initializeTracking();
    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `dixis_${timestamp}_${random}`;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track initial page load
    this.trackPageLoad();

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track({
        type: 'user_action',
        data: {
          action: document.hidden ? 'page_hidden' : 'page_visible',
          visibility_state: document.visibilityState,
        },
      });
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  private setupPerformanceObserver(): void {
    if (!this.config.enablePerformanceTracking || typeof window === 'undefined') return;

    try {
      // Core Web Vitals tracking
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const performanceEntry = entry as any;
          const value = performanceEntry.value || performanceEntry.duration || 0;
          this.track({
            type: 'performance',
            data: {
              metric: entry.name,
              value: value,
              rating: this.getPerformanceRating(entry.name, value),
            },
            performance: {
              [entry.name.replace('-', '_')]: value,
            },
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift'] });

      // Resource timing
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('api') || entry.name.includes('api/v1')) {
            this.track({
              type: 'performance',
              data: {
                api_call: entry.name,
                duration: (entry as PerformanceResourceTiming).duration,
                response_size: (entry as PerformanceResourceTiming).transferSize,
              },
            });
          }
        }
      }).observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking || typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.track({
        type: 'error',
        data: {
          error_type: 'javascript_error',
          message: event.message,
          filename: event.filename,
          line_number: event.lineno,
          column_number: event.colno,
          stack: event.error?.stack,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.track({
        type: 'error',
        data: {
          error_type: 'unhandled_promise_rejection',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
        },
      });
    });
  }

  private getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'largest-contentful-paint': { good: 2500, poor: 4000 },
      'first-input': { good: 100, poor: 300 },
      'cumulative-layout-shift': { good: 0.1, poor: 0.25 },
    } as const;

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.track({
      type: 'page_view',
      data: {
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        search: window.location.search,
        hash: window.location.hash,
      },
      performance: {
        page_load_time: navigationTiming?.loadEventEnd - navigationTiming?.loadEventStart,
        ttfb: navigationTiming?.responseStart - navigationTiming?.requestStart,
        fcp: this.getFirstContentfulPaint(),
      },
    });
  }

  private getFirstContentfulPaint(): number | undefined {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry?.startTime;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private createEventContext(): AnalyticsEvent['context'] {
    if (typeof window === 'undefined') {
      return {
        url: '',
        user_agent: '',
        device_type: 'desktop',
        viewport: { width: 0, height: 0 },
        language: 'el',
      };
    }

    return {
      url: window.location.href,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      device_type: this.getDeviceType(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language || 'el',
    };
  }

  public track(eventData: Partial<AnalyticsEvent>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      type: 'user_action',
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId,
      data: {},
      context: this.createEventContext(),
      ...eventData,
    };

    // Privacy filtering
    if (this.config.privacyMode) {
      event.context.user_agent = 'privacy-mode';
      if (event.user_id) event.user_id = undefined;
    }

    this.eventBuffer.push(event);

    if (this.config.enableConsoleLogging) {
      console.log('📊 Analytics Event:', {
        type: event.type,
        data: event.data,
        session: event.session_id.substring(0, 8) + '...',
      });
    }

    if (this.eventBuffer.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventBuffer.length > 0) {
        this.flushEvents();
      }
    }, this.config.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Store locally
      this.storeEventsLocally(eventsToFlush);

      // Send to API if endpoint configured
      if (this.config.apiEndpoint) {
        await this.sendEventsToAPI(eventsToFlush);
      }
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  private storeEventsLocally(events: AnalyticsEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('dixis_analytics_events');
      const existingEvents = stored ? JSON.parse(stored) : [];
      const allEvents = [...existingEvents, ...events];
      
      // Keep only last 500 events to prevent storage bloat
      const eventsToStore = allEvents.slice(-500);
      localStorage.setItem('dixis_analytics_events', JSON.stringify(eventsToStore));
    } catch (error) {
      console.warn('Failed to store events locally:', error);
    }
  }

  private async sendEventsToAPI(events: AnalyticsEvent[]): Promise<void> {
    const response = await fetch(this.config.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session_id: this.sessionId,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.status}`);
    }
  }

  // Public API methods
  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public trackPageView(path: string, title?: string): void {
    this.track({
      type: 'page_view',
      data: {
        path,
        title: title || document?.title,
        session_duration: Date.now() - this.startTime,
      },
    });
  }

  public trackClick(elementId: string, elementType: string, data?: Record<string, any>): void {
    this.track({
      type: 'click',
      data: {
        element_id: elementId,
        element_type: elementType,
        ...data,
      },
    });
  }

  public trackSearch(query: string, results?: number): void {
    this.track({
      type: 'search',
      data: {
        query,
        results_count: results,
        query_length: query.length,
      },
    });
  }

  public trackPurchase(orderId: string, value: number, items: any[]): void {
    this.track({
      type: 'purchase',
      data: {
        order_id: orderId,
        value,
        currency: 'EUR',
        item_count: items.length,
        items,
      },
    });
  }

  public getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('dixis_analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public clearData(): void {
    this.eventBuffer = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dixis_analytics_events');
    }
  }

  public destroy(): void {
    this.disable();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Global analytics instance
export const analyticsEngine = new AdvancedAnalyticsEngine({
  apiEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/v1/analytics/events',
});

// Export for use in components
export default analyticsEngine;