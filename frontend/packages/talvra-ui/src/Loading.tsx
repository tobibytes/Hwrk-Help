import styled, { keyframes } from 'styled-components';
import { type HTMLAttributes } from 'react';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Loading = styled.div<LoadingProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
    border: 2px solid ${({ theme }) => theme.colors.primary[300]};
    border-top-color: ${({ theme }) => theme.colors.primary[700]};
    animation: ${spin} 0.8s linear infinite;
  }
`;

