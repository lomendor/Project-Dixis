'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useFocusTrap } from '@/hooks/useAccessibility';

interface FocusManagerProps {
  children: ReactNode;
  isActive?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string; // CSS selector or 'first' or 'last'
  className?: string;
}

/**
 * Focus management component for modals, dialogs, and complex widgets
 */
export default function FocusManager({
  children,
  isActive = true,
  restoreFocus = true,
  initialFocus = 'first',
  className = '',
}: FocusManagerProps) {
  const containerRef = useFocusTrap(isActive);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element for restoration
    if (restoreFocus && !hasInitialized.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
      // Make container focusable if no focusable children
      container.setAttribute('tabindex', '0');
      container.focus();
      hasInitialized.current = true;
      return;
    }

    // Set initial focus based on configuration
    let targetElement: HTMLElement | null = null;

    if (initialFocus === 'first') {
      targetElement = focusableElements[0];
    } else if (initialFocus === 'last') {
      targetElement = focusableElements[focusableElements.length - 1];
    } else if (typeof initialFocus === 'string') {
      targetElement = container.querySelector(initialFocus);
    }

    if (targetElement) {
      targetElement.focus();
    }

    hasInitialized.current = true;

    // Cleanup function
    return () => {
      if (restoreFocus && previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, restoreFocus, initialFocus]);

  return (
    <div 
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={className}
      role="region"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

/**
 * Focus indicator component for better visual feedback
 */
export function FocusIndicator({ 
  visible = true,
  color = 'blue-500',
  thickness = 2 
}: { 
  visible?: boolean; 
  color?: string; 
  thickness?: number; 
}) {
  if (!visible) return null;

  return (
    <style jsx global>{`
      .focus-indicator:focus-visible {
        outline: ${thickness}px solid theme('colors.${color}');
        outline-offset: 2px;
        border-radius: 4px;
      }
    `}</style>
  );
}

/**
 * Roving tabindex component for managing focus in lists and menus
 */
export function RovingTabIndex({ 
  children,
  orientation = 'vertical',
  loop = true,
  className = ''
}: {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const items = getFocusableElements(container);
    
    if (items.length === 0) return;

    // Set initial tabindex values
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(activeElement);
      
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      switch (e.key) {
        case 'ArrowDown':
          if (isVertical) {
            e.preventDefault();
            nextIndex = getNextIndex(currentIndex, items.length, 1, loop);
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            e.preventDefault();
            nextIndex = getNextIndex(currentIndex, items.length, -1, loop);
          }
          break;
        case 'ArrowRight':
          if (isHorizontal) {
            e.preventDefault();
            nextIndex = getNextIndex(currentIndex, items.length, 1, loop);
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            e.preventDefault();
            nextIndex = getNextIndex(currentIndex, items.length, -1, loop);
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        // Update tabindex values
        items[currentIndex].setAttribute('tabindex', '-1');
        items[nextIndex].setAttribute('tabindex', '0');
        items[nextIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [orientation, loop]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="group"
    >
      {children}
    </div>
  );
}

// Utility functions
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'details',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelector)).filter(
    (el) => {
      const element = el as HTMLElement;
      return element.offsetParent !== null && // Element is visible
             getComputedStyle(element).visibility !== 'hidden' &&
             !element.hasAttribute('aria-hidden');
    }
  ) as HTMLElement[];
}

function getNextIndex(current: number, length: number, direction: number, loop: boolean): number {
  let next = current + direction;
  
  if (next < 0) {
    return loop ? length - 1 : 0;
  } else if (next >= length) {
    return loop ? 0 : length - 1;
  }
  
  return next;
}