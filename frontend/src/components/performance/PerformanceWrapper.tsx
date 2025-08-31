'use client';

import { ReactNode, useEffect } from 'react';
import { usePerformance, useRenderPerformance } from '@/hooks/usePerformance';

interface PerformanceWrapperProps {
  children: ReactNode;
  name: string;
  enableMetrics?: boolean;
  enableRenderTracking?: boolean;
  onMetricsUpdate?: (metrics: any) => void;
}

/**
 * Wrapper component for monitoring performance metrics
 */
export default function PerformanceWrapper({
  children,
  name,
  enableMetrics = process.env.NODE_ENV === 'development',
  enableRenderTracking = process.env.NODE_ENV === 'development',
  onMetricsUpdate,
}: PerformanceWrapperProps) {
  const { metrics, reportMetrics } = usePerformance();
  const { renderTime } = useRenderPerformance(name);

  useEffect(() => {
    if (!enableMetrics) return;

    // Report metrics after component mount and periodically
    const timeoutId = setTimeout(() => {
      const currentMetrics = reportMetrics();
      onMetricsUpdate?.(currentMetrics);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [enableMetrics, reportMetrics, onMetricsUpdate]);

  // Log render performance in development
  useEffect(() => {
    if (enableRenderTracking && renderTime > 0) {
      const isSlowRender = renderTime > 16; // 60fps threshold
      
      if (isSlowRender) {
        console.warn(`🐌 Slow render detected in ${name}: ${renderTime.toFixed(2)}ms`);
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name} rendered in ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [renderTime, enableRenderTracking, name]);

  return <>{children}</>;
}

/**
 * Component for displaying performance metrics (development only)
 */
export function PerformanceDebugger() {
  const { metrics, reportMetrics } = usePerformance();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      reportMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [reportMetrics]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getScoreColor = (metric: string, value: number | undefined) => {
    if (!value) return 'text-gray-400';
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500';
      case 'fid':
        return value <= 100 ? 'text-green-500' : value <= 300 ? 'text-yellow-500' : 'text-red-500';
      case 'cls':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500';
      case 'fcp':
        return value <= 1800 ? 'text-green-500' : value <= 3000 ? 'text-yellow-500' : 'text-red-500';
      case 'ttfb':
        return value <= 800 ? 'text-green-500' : value <= 1800 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">⚡ Performance Metrics</div>
      <div className="space-y-1">
        <div className={`flex justify-between ${getScoreColor('lcp', metrics.lcp)}`}>
          <span>LCP:</span>
          <span>{metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('fid', metrics.fid)}`}>
          <span>FID:</span>
          <span>{metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('cls', metrics.cls)}`}>
          <span>CLS:</span>
          <span>{metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('fcp', metrics.fcp)}`}>
          <span>FCP:</span>
          <span>{metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}</span>
        </div>
        <div className={`flex justify-between ${getScoreColor('ttfb', metrics.ttfb)}`}>
          <span>TTFB:</span>
          <span>{metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}</span>
        </div>
      </div>
      <button
        onClick={reportMetrics}
        className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        Refresh Metrics
      </button>
    </div>
  );
}

/**
 * Hook for tracking custom performance marks
 */
export function usePerformanceMarks(name: string) {
  const markStart = (label: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-${label}-start`);
    }
  };

  const markEnd = (label: string) => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      const startMark = `${name}-${label}-start`;
      const endMark = `${name}-${label}-end`;
      const measureName = `${name}-${label}`;
      
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measure = performance.getEntriesByName(measureName)[0];
      if (measure && process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${measureName}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  };

  return { markStart, markEnd };
}