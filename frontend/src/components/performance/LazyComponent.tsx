'use client';

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/usePerformance';
import { useState } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Wrapper for lazy loading components using Intersection Observer
 */
export default function LazyComponent({
  children,
  fallback = <LazyFallback />,
  rootMargin = '100px',
  threshold = 0.1,
  triggerOnce = true,
}: LazyComponentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const containerRef = useIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setShouldRender(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setShouldRender(false);
        }
      });
    },
    { rootMargin, threshold }
  );

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="min-h-[50px]">
      {shouldRender ? children : fallback}
    </div>
  );
}

/**
 * Default loading fallback component
 */
function LazyFallback() {
  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
      <div className="animate-pulse flex space-x-2">
        <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
        <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
        <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}

/**
 * Higher-order component for creating lazy-loaded components
 */
export function withLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyWrappedComponent = lazy(importFunc);

  return function LazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LazyFallback />}>
        <LazyWrappedComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Hook for creating intersection-observed lazy components
 */
export function useLazyRender(options?: {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const {
    rootMargin = '100px',
    threshold = 0.1,
    triggerOnce = true,
  } = options || {};

  const containerRef = useIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setShouldRender(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setShouldRender(false);
        }
      });
    },
    { rootMargin, threshold }
  );

  return {
    containerRef,
    shouldRender,
  };
}