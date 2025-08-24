import styled from 'styled-components';
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface TalvraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const TalvraButton = styled.button<TalvraButtonProps>`
  /* Basic button - no styling props, just a simple wrapper */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

export default TalvraButton;
