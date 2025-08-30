'use client';

import { useEffect, useRef } from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
}

function ToastItem({ toast }: ToastProps) {
  const { removeToast } = useToast();
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, removeToast]);

  // Announce to screen readers when toast appears
  useEffect(() => {
    if (toastRef.current) {
      // Create a screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `${toast.type}: ${toast.message}`;
      document.body.appendChild(announcement);
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [toast.type, toast.message]);

  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      removeToast(toast.id);
    }
  };

  const getToastStyles = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border border-green-700 shadow-green-200/50';
      case 'error':
        return 'bg-red-600 text-white border border-red-700 shadow-red-200/50';
      case 'warning':
        return 'bg-yellow-600 text-white border border-yellow-700 shadow-yellow-200/50';
      case 'info':
        return 'bg-blue-600 text-white border border-blue-700 shadow-blue-200/50';
      default:
        return 'bg-gray-600 text-white border border-gray-700 shadow-gray-200/50';
    }
  };

  const getIcon = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={toastRef}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid={`toast-${toast.type}`}
      className={`${getToastStyles(toast.type)} px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 min-w-[320px] max-w-[500px] transform transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-white`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-shrink-0" aria-hidden="true">
        {getIcon(toast.type)}
      </div>
      <div className="flex-1 font-medium text-sm" data-testid="toast-message">
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
        data-testid="toast-close"
        aria-label={`Dismiss ${toast.type} notification`}
        title="Press Escape or click to dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}