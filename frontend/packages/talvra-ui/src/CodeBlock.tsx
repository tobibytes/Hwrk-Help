import styled, { keyframes } from 'styled-components';
import { type HTMLAttributes } from 'react';

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {}

const appear = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const CodeBlock = styled.pre<CodeBlockProps>`
  white-space: pre-wrap;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono.join(', ')};
  color: ${({ theme }) => theme.colors.gray[800]};
  animation: ${appear} 200ms ease-out;
`;

export default CodeBlock;

