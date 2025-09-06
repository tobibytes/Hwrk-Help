import React from 'react';
import { Stack } from '@/components/ui/stack';
import { cn } from '@/lib/utils';

export interface TalvraStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
}

export const TalvraStack = React.forwardRef<HTMLDivElement, TalvraStackProps>(({ className, direction, ...props }, ref) => (
  <Stack ref={ref} className={cn(className)} {...(direction ? { direction } : {})} {...props} />
));

TalvraStack.displayName = 'TalvraStack';
