'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/usePerformance';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  aspectRatio?: string;
  eager?: boolean;
  onLoadComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * High-performance image component with lazy loading, aspect ratio preservation,
 * and fallback handling
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio,
  eager = false,
  className = '',
  sizes,
  priority,
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(eager || priority);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Intersection observer for lazy loading
  const imageRef = useIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      });
    },
    { rootMargin: '50px' }
  );

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.('Image failed to load, showing fallback');
    }
  };

  // Calculate aspect ratio style
  const aspectRatioStyle = aspectRatio ? {
    aspectRatio,
  } : {};

  return (
    <div 
      ref={imageRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatioStyle}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-pulse">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Actual image - only render when in view or eager/priority */}
      {isInView && (
        <Image
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'}
          priority={priority}
          {...props}
        />
      )}

      {/* Error state overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500 text-sm">
          <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}

/**
 * Preload critical images for above-the-fold content
 */
export function preloadImage(src: string, sizes?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (sizes) {
      link.setAttribute('imagesizes', sizes);
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Generate responsive image breakpoints
 */
export function generateImageSizes(config: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}): string {
  const { mobile = 100, tablet = 50, desktop = 25 } = config;
  
  return `(max-width: 768px) ${mobile}vw, (max-width: 1200px) ${tablet}vw, ${desktop}vw`;
}