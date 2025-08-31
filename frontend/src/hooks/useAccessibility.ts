'use client';

import { useState, useEffect, useRef } from 'react';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  screenReader: boolean;
}

/**
 * Hook for managing accessibility preferences
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    highContrast: false,
    fontSize: 'normal',
    screenReader: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check media queries
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    // Detect screen reader usage
    const hasScreenReader = 
      'speechSynthesis' in window || 
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver');

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion: motionQuery.matches,
        highContrast: contrastQuery.matches,
        screenReader: hasScreenReader,
      }));
    };

    updatePreferences();

    // Listen for changes
    motionQuery.addEventListener?.('change', updatePreferences);
    contrastQuery.addEventListener?.('change', updatePreferences);

    return () => {
      motionQuery.removeEventListener?.('change', updatePreferences);
      contrastQuery.removeEventListener?.('change', updatePreferences);
    };
  }, []);

  const updateFontSize = (size: AccessibilityPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    // Update CSS custom property
    if (typeof document !== 'undefined') {
      const multiplier = size === 'large' ? 1.2 : size === 'extra-large' ? 1.4 : 1;
      document.documentElement.style.setProperty('--font-size-multiplier', multiplier.toString());
    }
  };

  return {
    preferences,
    updateFontSize,
  };
}

/**
 * Hook for managing focus within a container (focus trap)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element
    firstElement?.focus();
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for announcing dynamic content changes to screen readers
 */
export function useScreenReaderAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;
    
    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    }, 1000);
  };

  // Create invisible announcer element
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    };
  }, []);

  return { announce };
}