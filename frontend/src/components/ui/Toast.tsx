'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'relative flex items-center space-x-2 rounded-md border p-4 shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 bg-white',
        success: 'border-success-500 bg-success-50 text-success-800',
        error: 'border-error-500 bg-error-50 text-error-800',
        info: 'border-info-500 bg-info-50 text-info-800'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

const Toast = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
));
Toast.displayName = 'Toast';

const ToastClose = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn('absolute right-1 top-1 p-1 text-neutral-500 hover:text-neutral-700', className)}
      {...props}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
);
ToastClose.displayName = 'ToastClose';

const ToastTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-semibold greek-text', className)} {...props} />
  )
);
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm greek-text', className)} {...props} />
  )
);
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastClose, ToastTitle, ToastDescription };