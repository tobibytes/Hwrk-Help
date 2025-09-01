import styled from 'styled-components';
import type { HTMLAttributes, ReactNode } from 'react';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Chip = styled.span<ChipProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.gray[800]};
  background: ${({ theme }) => theme.colors.gray[100]};

  ${({ variant, theme }) => variant === 'success' && `
    color: ${theme.colors.green[800]};
    background: ${theme.colors.green[100]};
    border-color: ${theme.colors.green[200]};
  `}
  ${({ variant, theme }) => variant === 'warning' && `
    color: ${theme.colors.amber[800]};
    background: ${theme.colors.amber[100]};
    border-color: ${theme.colors.amber[200]};
  `}
  ${({ variant, theme }) => variant === 'danger' && `
    color: ${theme.colors.red[800]};
    background: ${theme.colors.red[100]};
    border-color: ${theme.colors.red[200]};
  `}
  ${({ variant, theme }) => variant === 'info' && `
    color: ${theme.colors.blue[800]};
    background: ${theme.colors.blue[100]};
    border-color: ${theme.colors.blue[200]};
  `}
`;
