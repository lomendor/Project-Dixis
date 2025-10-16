import * as React from 'react';
import { cn } from '../../lib/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline'
};

export function Button({ className, variant='default', ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-3';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    ghost: 'bg-transparent hover:bg-neutral-100',
    outline: 'border border-neutral-300 hover:bg-neutral-100'
  } as const;
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
