import styled from 'styled-components';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
}

export const Textarea = styled.textarea<TextareaProps>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  padding: 0.5rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  box-shadow: ${({ theme }) => theme.shadows.inner};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono.join(', ')};
  transition: ${({ theme }) => theme.transitions.colors};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[600]};
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export default Textarea;
