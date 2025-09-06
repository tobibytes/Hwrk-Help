import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = 'md', variant = 'spinner', text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    if (variant === 'spinner') {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-2', className)}
          {...props}
        >
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-transparent border-t-primary',
              sizeClasses[size]
            )}
          />
          {text && (
            <span className="text-sm text-foreground-secondary animate-pulse">
              {text}
            </span>
          )}
        </div>
      );
    }

    if (variant === 'dots') {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-1', className)}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-primary animate-pulse',
                size === 'sm' && 'h-1 w-1',
                size === 'md' && 'h-1.5 w-1.5',
                size === 'lg' && 'h-2 w-2'
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
          {text && (
            <span className="ml-2 text-sm text-foreground-secondary animate-pulse">
              {text}
            </span>
          )}
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          {...props}
        >
          <div className="space-y-2">
            <div className="h-4 bg-background-secondary rounded animate-pulse" />
            <div className="h-4 bg-background-secondary rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-background-secondary rounded w-1/2 animate-pulse" />
          </div>
          {text && (
            <span className="text-sm text-foreground-secondary">
              {text}
            </span>
          )}
        </div>
      );
    }

    return null;
  }
);

Loading.displayName = 'Loading';

export { Loading };