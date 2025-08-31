'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  processingStart?: number;
  startTime: number;
  value?: number;
  sources?: Array<{ node?: Node; previousRect?: DOMRect; currentRect?: DOMRect }>;
}

/**
 * Hook for monitoring Core Web Vitals without external dependencies
 */
export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({});
  const observersRef = useRef<Array<PerformanceObserver | IntersectionObserver>>([]);

  // Web Vitals measurement functions
  const measureLCP = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metricsRef.current.lcp = lastEntry.startTime;
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observersRef.current.push(observer);
    } catch (e) {
      // LCP not supported
    }
  }, []);

  const measureFID = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      entries.forEach((entry) => {
        const delay = entry.processingStart! - entry.startTime;
        metricsRef.current.fid = delay;
      });
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
      observersRef.current.push(observer);
    } catch (e) {
      // FID not supported
    }
  }, []);

  const measureCLS = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      entries.forEach((entry) => {
        if (entry.value && entry.sources && entry.sources.length > 0) {
          clsValue += entry.value;
        }
      });
      metricsRef.current.cls = clsValue;
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
      observersRef.current.push(observer);
    } catch (e) {
      // CLS not supported
    }
  }, []);

  const measureFCP = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metricsRef.current.fcp = entry.startTime;
        }
      });
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
      observersRef.current.push(observer);
    } catch (e) {
      // FCP not supported
    }
  }, []);

  const measureTTFB = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) return;

    const [navigation] = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigation) {
      metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }, []);

  // Initialize all measurements
  useEffect(() => {
    measureLCP();
    measureFID();
    measureCLS();
    measureFCP();
    measureTTFB();

    return () => {
      // Cleanup observers
      observersRef.current.forEach((observer) => {
        if ('disconnect' in observer) {
          observer.disconnect();
        }
      });
      observersRef.current = [];
    };
  }, [measureLCP, measureFID, measureCLS, measureFCP, measureTTFB]);

  // Report metrics (for debugging/monitoring)
  const reportMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics');
      if (metrics.lcp) console.log(`LCP: ${Math.round(metrics.lcp)}ms`);
      if (metrics.fid) console.log(`FID: ${Math.round(metrics.fid)}ms`);
      if (metrics.cls) console.log(`CLS: ${metrics.cls.toFixed(3)}`);
      if (metrics.fcp) console.log(`FCP: ${Math.round(metrics.fcp)}ms`);
      if (metrics.ttfb) console.log(`TTFB: ${Math.round(metrics.ttfb)}ms`);
      console.groupEnd();
    }

    return metrics;
  }, []);

  return {
    metrics: metricsRef.current,
    reportMetrics,
  };
}

/**
 * Hook for intersection observer-based lazy loading
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!targetRef.current || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });

    observerRef.current.observe(targetRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    mountTimeRef.current = performance.now() - renderStartRef.current;
    
    if (process.env.NODE_ENV === 'development' && mountTimeRef.current > 16) {
      console.warn(`⚠️ ${componentName} took ${Math.round(mountTimeRef.current)}ms to render (>16ms)`);
    }
  }, [componentName]);

  return {
    renderTime: mountTimeRef.current,
  };
}