import styled from 'styled-components';
import { type ReactNode, type AnchorHTMLAttributes } from 'react';

export interface TalvraLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export const TalvraLink = styled.a<TalvraLinkProps>`
  /* Basic link with default styling */
  display: inline;
  color: #2563eb;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
  
  &:hover {
    color: #1d4ed8;
    text-decoration: none;
  }
  
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export default TalvraLink;
