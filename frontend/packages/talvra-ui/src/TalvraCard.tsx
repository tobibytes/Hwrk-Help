import styled from 'styled-components';
import { type ReactNode } from 'react';

export interface TalvraCardProps {
  children: ReactNode;
  className?: string;
}

export const TalvraCard = styled.div<TalvraCardProps>`
  display: block;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing[6]};
  transition: ${({ theme }) => theme.transitions.shadow};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

export default TalvraCard;
