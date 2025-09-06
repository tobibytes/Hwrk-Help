import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const chipVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all duration-fast',
  {
    variants: {
      variant: {
        default: 'bg-background-secondary text-foreground border border-border',
        primary: 'bg-primary-light text-primary border border-primary/20',
        secondary: 'bg-secondary-light text-secondary border border-secondary/20',
        accent: 'bg-accent-light text-accent border border-accent/20',
        success: 'bg-success-light text-success border border-success/20',
        warning: 'bg-warning-light text-warning-foreground border border-warning/20',
        destructive: 'bg-destructive-light text-destructive border border-destructive/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ChipProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, size, removable, onRemove, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current"
            aria-label="Remove"
          >
            <span className="text-xs">×</span>
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip, chipVariants };