import React from 'react';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';

export interface TalvraCardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'card';
}

export const TalvraCard = React.forwardRef<HTMLDivElement, TalvraCardProps>(({ className, padding = 'lg', variant = 'card', ...props }, ref) => (
  <Surface ref={ref} padding={padding} variant={variant} className={cn(className)} {...props} />
));

TalvraCard.displayName = 'TalvraCard';
