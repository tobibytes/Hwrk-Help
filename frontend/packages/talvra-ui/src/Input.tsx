import styled from 'styled-components';
import { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const Input = styled.input<InputProps>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  box-shadow: ${({ theme }) => theme.shadows.inner};
  transition: ${({ theme }) => theme.transitions.colors};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[600]};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export default Input;

