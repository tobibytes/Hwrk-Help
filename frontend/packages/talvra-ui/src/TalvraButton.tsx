import styled from 'styled-components';
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface TalvraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const TalvraButton = styled.button<TalvraButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.5rem 1rem;
  font: inherit;
  box-shadow: ${({ theme }) => theme.shadows.base};
  transition: ${({ theme }) => theme.transitions.all};

  /* default (primary) */
  background: ${({ theme, variant }) => variant === 'danger' ? theme.colors.danger[600]
    : variant === 'secondary' ? theme.colors.white
    : variant === 'ghost' ? 'transparent'
    : theme.colors.primary[600]};
  color: ${({ theme, variant }) => variant === 'secondary' ? theme.colors.gray[800]
    : variant === 'ghost' ? theme.colors.primary[700]
    : theme.colors.white};
  border-color: ${({ theme, variant }) => variant === 'secondary' ? theme.colors.gray[300] : 'transparent'};

  &:hover {
    background: ${({ theme, variant }) => variant === 'danger' ? theme.colors.danger[700]
      : variant === 'secondary' ? theme.colors.gray[50]
      : variant === 'ghost' ? theme.colors.primary[50]
      : theme.colors.primary[700]};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default TalvraButton;
