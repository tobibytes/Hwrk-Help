import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

export const TalvraButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} {...props} />
));

TalvraButton.displayName = 'TalvraButton';
