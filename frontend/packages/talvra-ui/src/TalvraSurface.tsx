import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TalvraSurface = styled.div<TalvraSurfaceProps>`
  /* Basic surface container with minimal default styling */
  display: block;
  padding: 2rem;
  min-height: 100vh;
  background-color: #ffffff;
`;

export default TalvraSurface;
