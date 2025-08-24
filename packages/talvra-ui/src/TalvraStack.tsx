import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraStackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TalvraStack = styled.div<TalvraStackProps>`
  /* Basic stack container with default column layout and spacing */
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default TalvraStack;
