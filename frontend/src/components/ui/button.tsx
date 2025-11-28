import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - Mobile-first: generous touch targets, readable text
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] touch-manipulation',
  {
    variants: {
      variant: {
        // Primary - Cyprus Green with glow hover
        default: 'bg-primary text-white hover:bg-primary-light hover:shadow-glow active:scale-[0.98]',
        // Secondary - Outlined
        secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary-pale active:scale-[0.98]',
        // Ghost - Subtle
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
        // Outline - Light border
        outline: 'border border-neutral-300 bg-white hover:bg-neutral-50 hover:border-neutral-400',
        // Danger - Red
        danger: 'bg-danger text-white hover:bg-red-600 active:scale-[0.98]',
        // Link - Text only
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto min-h-0',
      },
      size: {
        // Mobile-first: default is touch-friendly
        default: 'h-12 px-5 py-3.5',
        sm: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-11 w-11 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'default', size: 'default', fullWidth: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
