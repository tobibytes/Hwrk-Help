import styled from 'styled-components';
import { type ReactNode } from 'react';

export interface TalvraCardProps {
  children: ReactNode;
  className?: string;
}

export const TalvraCard = styled.div<TalvraCardProps>`
  /* Basic card container with minimal default styling */
  display: block;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

export default TalvraCard;
