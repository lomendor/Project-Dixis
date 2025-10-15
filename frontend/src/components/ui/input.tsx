import * as React from 'react';
import { cn } from '../../lib/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('flex h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-black', className)}
      {...props}
    />
  )
);
Input.displayName='Input';
