import styled from 'styled-components';

import type React from 'react';

export interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  color?: 'gray-900' | 'gray-700' | 'gray-500' | 'blue-600' | 'red-600';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  as?: keyof React.JSX.IntrinsicElements;
}

const variantStyles = {
  h1: {
    fontSize: '2.25rem',
    lineHeight: '2.5rem',
    fontWeight: 'bold',
  },
  h2: {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    fontWeight: 'semibold',
  },
  h3: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 'semibold',
  },
  h4: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: 'medium',
  },
  body: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontWeight: 'normal',
  },
  small: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 'normal',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 'normal',
  },
};

const colorMap = {
  'gray-900': '#111827',
  'gray-700': '#374151',
  'gray-500': '#6b7280',
  'blue-600': '#2563eb',
  'red-600': '#dc2626',
};

const weightMap = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Text = styled.span.attrs<TextProps>(({ as, variant }) => ({
  as: as || (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'h4' ? variant : 'span'),
}))<TextProps>`
  font-size: ${({ variant = 'body' }) => variantStyles[variant].fontSize};
  line-height: ${({ variant = 'body' }) => variantStyles[variant].lineHeight};
  font-weight: ${({ weight, variant = 'body' }) => 
    weight ? weightMap[weight] : weightMap[variantStyles[variant].fontWeight as keyof typeof weightMap]};
  color: ${({ color = 'gray-900' }) => colorMap[color]};
  text-align: ${({ align = 'left' }) => align};
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export default Text;
