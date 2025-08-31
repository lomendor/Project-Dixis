'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FocusManager from './FocusManager';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Fully accessible modal component with focus management,
 * keyboard navigation, and screen reader support
 */
export default function AccessibleModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'md',
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { preferences } = useAccessibility();
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const animationClasses = preferences.prefersReducedMotion 
    ? '' 
    : 'transition-all duration-300 ease-out';

  const modal = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${animationClasses} ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <FocusManager
        isActive={isOpen}
        restoreFocus={true}
        initialFocus=".modal-close, button, [href], input, textarea, select"
        className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}
      >
        <div ref={modalRef} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 
                id="modal-title" 
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="modal-close ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Κλείσιμο παραθύρου"
              type="button"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          {description && (
            <p 
              id="modal-description" 
              className="text-gray-600 mb-4"
            >
              {description}
            </p>
          )}

          {/* Content */}
          <div className="modal-content">
            {children}
          </div>
        </div>
      </FocusManager>
    </div>
  );

  // Render modal in portal to avoid z-index issues
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
}

/**
 * Confirmation modal with accessible design
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Επιβεβαίωση",
  message,
  confirmLabel = "Επιβεβαίωση",
  cancelLabel = "Ακύρωση",
  variant = "default"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
}) {
  const confirmButtonClass = variant === "danger" 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white";

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      size="sm"
    >
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButtonClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    </AccessibleModal>
  );
}

/**
 * Loading modal for async operations
 */
export function LoadingModal({
  isOpen,
  message = "Φόρτωση..."
}: {
  isOpen: boolean;
  message?: string;
}) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={() => {}} // Not closable
      closeOnEscape={false}
      closeOnOverlayClick={false}
      size="sm"
    >
      <div className="flex flex-col items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </AccessibleModal>
  );
}