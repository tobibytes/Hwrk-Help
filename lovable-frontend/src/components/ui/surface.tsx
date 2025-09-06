import React from 'react';
import { cn } from '@/lib/utils';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'card';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative rounded-lg border transition-all duration-smooth',
          
          // Variants
          {
            'bg-background border-border': variant === 'default',
            'glass-panel': variant === 'glass',
            'academic-card': variant === 'card',
          },
          
          // Padding
          {
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
            'p-12': padding === 'xl',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';

export { Surface };