import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const TalvraText = styled.div.withConfig({
  // In styled-components shouldForwardProp, treat prop as a string to avoid TS comparing keyof unions
  shouldForwardProp: (prop: string) => prop !== 'as',
})<TalvraTextProps>`
  /* Basic text with semantic styling based on 'as' prop */
  display: block;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: #374151;
  
  /* Heading styles when used with 'as' prop */
  ${props => props.as === 'h1' && `
    font-size: 2.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  `}
  
  ${props => props.as === 'h2' && `
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  `}
  
  ${props => props.as === 'h3' && `
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  `}
  
  ${props => (props.as === 'p' || !props.as) && `
    font-size: 1rem;
    line-height: 1.6;
  `}
`;

export default TalvraText;
