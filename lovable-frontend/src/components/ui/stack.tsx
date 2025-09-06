import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = 'column', 
    gap = 'md', 
    align = 'stretch',
    justify = 'start',
    wrap = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          
          // Direction
          {
            'flex-row': direction === 'row',
            'flex-col': direction === 'column',
          },
          
          // Gap
          {
            'gap-0': gap === 'none',
            'gap-1': gap === 'xs',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          
          // Align
          {
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
          },
          
          // Justify
          {
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',
          },
          
          // Wrap
          {
            'flex-wrap': wrap,
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

Stack.displayName = 'Stack';

export { Stack };