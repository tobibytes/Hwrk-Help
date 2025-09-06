import React from 'react';
import { Input, type InputProps } from '@/components/ui/input';

export const TalvraInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input ref={ref} {...props} />
));

TalvraInput.displayName = 'TalvraInput';
