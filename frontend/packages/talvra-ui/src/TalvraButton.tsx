import styled from 'styled-components';
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface TalvraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const TalvraButton = styled.button<TalvraButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary[600]};
  color: ${({ theme }) => theme.colors.white};
  padding: 0.5rem 1rem;
  font: inherit;
  box-shadow: ${({ theme }) => theme.shadows.base};
  transition: ${({ theme }) => theme.transitions.all};

  &:hover {
    background: ${({ theme }) => theme.colors.primary[700]};
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
