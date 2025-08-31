'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's motion preferences
 * Respects prefers-reduced-motion media query
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create handler for changes
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    
    // Use addListener for better browser compatibility
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener?.(handleChange);
    } else {
      // Fallback for newer browsers
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get safe CSS classes based on motion preferences
 */
export function useMotionSafeClasses() {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    transition: prefersReducedMotion ? '' : 'transition-all duration-200',
    hover: prefersReducedMotion ? '' : 'hover:scale-105',
    focus: prefersReducedMotion ? '' : 'focus:scale-105',
    animation: prefersReducedMotion ? '' : 'animate-fade-in',
    transform: prefersReducedMotion ? '' : 'transform',
  };
}