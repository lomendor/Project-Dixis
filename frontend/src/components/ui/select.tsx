import * as React from 'react';
import { cn } from '../../lib/cn';

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-black', className)}
      {...props}
    />
  );
}
