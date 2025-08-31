'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useScreenReaderAnnouncer } from '@/hooks/useAccessibility';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Component for screen reader only content
 */
export function ScreenReaderOnly({ 
  children, 
  className = '' 
}: ScreenReaderOnlyProps) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
}

/**
 * Live region component for announcing dynamic changes
 */
export function LiveRegion({
  message,
  priority = 'polite',
  clearAfter = 3000,
}: {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = '';
      }
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Status announcer component for form validation and dynamic content
 */
export function StatusAnnouncer({
  message,
  type = 'info',
  isVisible = false,
}: {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  isVisible?: boolean;
}) {
  const { announce } = useScreenReaderAnnouncer();

  useEffect(() => {
    if (message) {
      const priority = type === 'error' ? 'assertive' : 'polite';
      announce(message, priority);
    }
  }, [message, type, announce]);

  if (!isVisible || !message) return null;

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconMap = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3 border rounded-md ${typeStyles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {iconMap[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/**
 * Progress announcer for long-running operations
 */
export function ProgressAnnouncer({
  progress,
  total,
  label,
  format = 'percentage',
}: {
  progress: number;
  total: number;
  label: string;
  format?: 'percentage' | 'steps';
}) {
  const { announce } = useScreenReaderAnnouncer();
  const lastAnnouncedRef = useRef<number>(-1);

  useEffect(() => {
    const percentage = Math.round((progress / total) * 100);
    const shouldAnnounce = percentage % 10 === 0 && percentage !== lastAnnouncedRef.current;
    
    if (shouldAnnounce) {
      let message = '';
      if (format === 'percentage') {
        message = `${label}: ${percentage}% complete`;
      } else {
        message = `${label}: step ${progress} of ${total}`;
      }
      
      announce(message);
      lastAnnouncedRef.current = percentage;
    }
  }, [progress, total, label, format, announce]);

  return null;
}

/**
 * Form field description helper
 */
export function FieldDescription({
  id,
  children,
  className = '',
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div 
      id={id}
      className={`text-sm text-gray-600 mt-1 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Error message component with proper ARIA support
 */
export function ErrorMessage({
  id,
  message,
  className = '',
}: {
  id: string;
  message: string;
  className?: string;
}) {
  const { announce } = useScreenReaderAnnouncer();

  useEffect(() => {
    if (message) {
      announce(`Error: ${message}`, 'assertive');
    }
  }, [message, announce]);

  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`text-sm text-red-600 mt-1 flex items-center gap-1 ${className}`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

/**
 * Success message component
 */
export function SuccessMessage({
  id,
  message,
  className = '',
}: {
  id: string;
  message: string;
  className?: string;
}) {
  const { announce } = useScreenReaderAnnouncer();

  useEffect(() => {
    if (message) {
      announce(`Success: ${message}`, 'polite');
    }
  }, [message, announce]);

  if (!message) return null;

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      className={`text-sm text-green-600 mt-1 flex items-center gap-1 ${className}`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}