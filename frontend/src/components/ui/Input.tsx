'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors greek-text',
  {
    variants: {
      variant: {
        default: 'border-neutral-300',
        error: 'border-error-500 focus:ring-error-500'
      },
      size: {
        md: 'h-10 px-3 text-sm'
      }
    },
    defaultVariants: { variant: 'default', size: 'md' }
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, label, required, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-neutral-700 greek-text">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(inputVariants({ variant: inputVariant, size }), className)}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-error-600 greek-text">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };