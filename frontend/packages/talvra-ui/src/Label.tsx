import styled from 'styled-components';
import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  helperText?: ReactNode;
}

export const Label = styled.label<LabelProps>`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  color: ${({ theme }) => theme.colors.gray[800]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  & > span.label-text {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  & > small.helper-text {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

export default Label;
