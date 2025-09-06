import React from 'react';
import { Box } from '@/components/ui/box';
import { cn } from '@/lib/utils';

export interface TalvraBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TalvraBox = React.forwardRef<HTMLDivElement, TalvraBoxProps>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn(className)} {...props} />
));

TalvraBox.displayName = 'TalvraBox';
