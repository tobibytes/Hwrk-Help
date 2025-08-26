import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraStackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TalvraStack = styled.div<TalvraStackProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export default TalvraStack;
