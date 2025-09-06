import React from 'react';
import { Chip, type ChipProps } from '@/components/ui/chip';

export const TalvraChip = React.forwardRef<HTMLSpanElement, ChipProps>((props, ref) => (
  <Chip ref={ref} {...props} />
));

TalvraChip.displayName = 'TalvraChip';
