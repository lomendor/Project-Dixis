// Enhanced Analytics Hook - PP03-E
// Comprehensive React hook for analytics integration

import { useCallback, useEffect, useRef } from 'react';
import { analyticsEngine } from '@/lib/analytics/analyticsEngine';
import { eventBatcher } from '@/lib/analytics/eventBatcher';
import { insightsGenerator } from '@/lib/analytics/insightsGenerator';
import { privacyManager } from '@/lib/analytics/privacyManager';
import type { AnalyticsEvent } from '@/lib/analytics/analyticsEngine';
import type { Insight } from '@/lib/analytics/insightsGenerator';

export interface UseAnalyticsReturn {
  // Core tracking methods
  trackPageView: (path?: string, title?: string) => void;
  trackClick: (elementId: string, elementType: string, data?: Record<string, any>) => void;
  trackSearch: (query: string, results?: number) => void;
  trackPurchase: (orderId: string, value: number, items: any[]) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackCustomEvent: (type: string, data: Record<string, any>) => void;
  
  // User management
  setUserId: (userId: number) => void;
  
  // Privacy & consent
  hasConsent: boolean;
  canTrack: boolean;
  requestConsent: () => void;
  updateConsentSettings: (settings: Record<string, boolean>) => void;
  
  // Analytics insights
  generateInsights: () => Promise<Insight[]>;
  getMetrics: () => Promise<any>;
  
  // Debug & development
  getStoredEvents: () => AnalyticsEvent[];
  clearData: () => void;
  exportData: () => string;
}

export function useAnalytics(): UseAnalyticsReturn {
  const initializedRef = useRef(false);
  const hasConsent = privacyManager.hasConsented();
  const canTrack = privacyManager.canCollectAnalytics();

  // Initialize analytics on first use
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      
      // Auto-track page view if consent exists
      if (canTrack) {
        trackPageView();
      }

      // Listen for consent changes
      const unsubscribe = privacyManager.onConsentChange((preferences) => {
        if (preferences?.settings.analytics) {
          // Re-enable tracking and catch up on page view
          trackPageView();
        } else {
          // Clear analytics data if consent revoked
          analyticsEngine.clearData();
        }
      });

      return unsubscribe;
    }
  }, [canTrack]);

  // Core tracking methods
  const trackPageView = useCallback((path?: string, title?: string) => {
    if (!canTrack) return;
    
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
    const currentTitle = title || (typeof document !== 'undefined' ? document.title : '');
    
    analyticsEngine.trackPageView(currentPath, currentTitle);
  }, [canTrack]);

  const trackClick = useCallback((elementId: string, elementType: string, data?: Record<string, any>) => {
    if (!canTrack) return;
    
    analyticsEngine.trackClick(elementId, elementType, {
      ...data,
      timestamp: Date.now(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  }, [canTrack]);

  const trackSearch = useCallback((query: string, results?: number) => {
    if (!canTrack) return;
    
    analyticsEngine.trackSearch(query, results);
  }, [canTrack]);

  const trackPurchase = useCallback((orderId: string, value: number, items: any[]) => {
    if (!canTrack) return;
    
    analyticsEngine.trackPurchase(orderId, value, items);
  }, [canTrack]);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    // Error tracking is allowed even without analytics consent for debugging
    analyticsEngine.track({
      type: 'error',
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: context || {},
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    });
  }, []);

  const trackCustomEvent = useCallback((type: string, data: Record<string, any>) => {
    if (!canTrack) return;
    
    analyticsEngine.track({
      type: type as any,
      data: {
        ...data,
        custom: true,
        tracked_at: new Date().toISOString(),
      },
    });
  }, [canTrack]);

  // User management
  const setUserId = useCallback((userId: number) => {
    analyticsEngine.setUserId(userId);
  }, []);

  // Privacy & consent
  const requestConsent = useCallback(() => {
    // This would typically open a consent modal
    // For now, we'll grant minimal consent
    privacyManager.grantConsent({
      functional: true,
      analytics: true,
      performance: false,
      marketing: false,
    });
  }, []);

  const updateConsentSettings = useCallback((settings: Record<string, boolean>) => {
    privacyManager.updateConsentSettings(settings);
  }, []);

  // Analytics insights
  const generateInsights = useCallback(async (): Promise<Insight[]> => {
    const events = analyticsEngine.getStoredEvents();
    return insightsGenerator.analyzeEvents(events);
  }, []);

  const getMetrics = useCallback(async () => {
    const events = analyticsEngine.getStoredEvents();
    return insightsGenerator.getMetrics(events);
  }, []);

  // Debug & development
  const getStoredEvents = useCallback((): AnalyticsEvent[] => {
    return analyticsEngine.getStoredEvents();
  }, []);

  const clearData = useCallback(() => {
    analyticsEngine.clearData();
    eventBatcher.clear();
  }, []);

  const exportData = useCallback((): string => {
    const events = analyticsEngine.getStoredEvents();
    const batcherStats = eventBatcher.getStats();
    const privacyData = privacyManager.exportUserData();
    
    return JSON.stringify({
      events,
      batcher_stats: batcherStats,
      privacy: JSON.parse(privacyData),
      exported_at: new Date().toISOString(),
      session_id: analyticsEngine.getSessionId(),
    }, null, 2);
  }, []);

  return {
    // Core tracking
    trackPageView,
    trackClick,
    trackSearch,
    trackPurchase,
    trackError,
    trackCustomEvent,
    
    // User management
    setUserId,
    
    // Privacy & consent
    hasConsent,
    canTrack,
    requestConsent,
    updateConsentSettings,
    
    // Analytics insights
    generateInsights,
    getMetrics,
    
    // Debug & development
    getStoredEvents,
    clearData,
    exportData,
  };
}

// Specialized hooks for specific use cases
export function usePageAnalytics(title: string, customData?: Record<string, any>) {
  const { trackPageView, canTrack } = useAnalytics();
  
  useEffect(() => {
    if (canTrack) {
      trackPageView(undefined, title);
      
      // Track additional page-specific data
      if (customData) {
        analyticsEngine.track({
          type: 'page_view',
          data: {
            ...customData,
            page_title: title,
          },
        });
      }
    }
  }, [title, customData, trackPageView, canTrack]);
}

export function useClickTracking(elementRef: React.RefObject<HTMLElement>, elementId: string, elementType: string = 'button') {
  const { trackClick } = useAnalytics();
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleClick = (event: MouseEvent) => {
      trackClick(elementId, elementType, {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        ctrl_key: event.ctrlKey,
        shift_key: event.shiftKey,
        alt_key: event.altKey,
      });
    };
    
    element.addEventListener('click', handleClick);
    
    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [elementRef, elementId, elementType, trackClick]);
}

export function useSearchTracking() {
  const { trackSearch } = useAnalytics();
  
  const trackSearchQuery = useCallback((query: string, results?: number, metadata?: Record<string, any>) => {
    trackSearch(query, results);
    
    // Track additional search metadata
    if (metadata) {
      analyticsEngine.track({
        type: 'search',
        data: {
          query,
          results_count: results,
          ...metadata,
          search_timestamp: Date.now(),
        },
      });
    }
  }, [trackSearch]);
  
  return { trackSearchQuery };
}

export function useErrorTracking() {
  const { trackError } = useAnalytics();
  
  // Automatic error boundary tracking
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        type: 'promise_rejection',
        reason: event.reason,
      });
    };
    
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);
  
  const trackCustomError = useCallback((error: Error, context?: Record<string, any>) => {
    trackError(error, context);
  }, [trackError]);
  
  return { trackCustomError };
}

// Performance monitoring hook
export function usePerformanceTracking() {
  const { trackCustomEvent, canTrack } = useAnalytics();
  
  useEffect(() => {
    if (!canTrack || !privacyManager.canCollectPerformance()) return;
    
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const performanceEntry = entry as any;
        const value = performanceEntry.value || performanceEntry.duration || 0;
        trackCustomEvent('performance_metric', {
          name: entry.name,
          value: value,
          entry_type: entry.entryType,
          start_time: entry.startTime,
        });
      });
    });
    
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [trackCustomEvent, canTrack]);
}

export default useAnalytics;