import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface TalvraTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const TalvraText = styled.div<TalvraTextProps>`
  display: block;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.sans.join(', ')};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.gray[800]};

  ${props => props.as === 'h1' && `
    font-size: ${props.theme.typography.fontSize['4xl']};
    font-weight: ${props.theme.typography.fontWeight.bold};
    color: ${props.theme.colors.gray[900]};
    margin-bottom: ${props.theme.spacing[2]};
  `}

  ${props => props.as === 'h2' && `
    font-size: ${props.theme.typography.fontSize['3xl']};
    font-weight: ${props.theme.typography.fontWeight.semibold};
    color: ${props.theme.colors.gray[900]};
    margin-bottom: ${props.theme.spacing[2]};
  `}

  ${props => props.as === 'h3' && `
    font-size: ${props.theme.typography.fontSize['2xl']};
    font-weight: ${props.theme.typography.fontWeight.semibold};
    color: ${props.theme.colors.gray[900]};
    margin-bottom: ${props.theme.spacing[2]};
  `}

  ${props => (props.as === 'p' || !props.as) && `
    font-size: ${props.theme.typography.fontSize.base};
    line-height: ${props.theme.typography.lineHeight.relaxed};
  `}
`;

export default TalvraText;
