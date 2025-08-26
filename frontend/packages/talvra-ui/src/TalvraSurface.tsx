import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TalvraSurface = styled.div<TalvraSurfaceProps>`
  display: block;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.gray[50]} 0%, ${({ theme }) => theme.colors.white} 100%);
  color: ${({ theme }) => theme.colors.gray[800]};
  transition: ${({ theme }) => theme.transitions.colors};
`;

export default TalvraSurface;
