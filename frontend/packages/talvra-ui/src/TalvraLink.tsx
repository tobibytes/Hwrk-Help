import styled from 'styled-components';
import { type ReactNode, type AnchorHTMLAttributes } from 'react';

export interface TalvraLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export const TalvraLink = styled.a<TalvraLinkProps>`
  display: inline;
  color: ${({ theme }) => theme.colors.primary[600]};
  text-decoration: none;
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.colors};

  &:hover {
    color: ${({ theme }) => theme.colors.primary[700]};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[600]};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export default TalvraLink;
