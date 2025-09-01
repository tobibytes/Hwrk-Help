import styled from 'styled-components';

export interface PageContainerProps {
  maxWidth?: number; // px
  paddingX?: string; // e.g. '1rem'
}

export const PageContainer = styled.div<PageContainerProps>`
  width: 100%;
  max-width: ${({ maxWidth = 1200 }) => `${maxWidth}px`};
  margin: 0 auto;
  padding-left: ${({ paddingX = '1rem' }) => paddingX};
  padding-right: ${({ paddingX = '1rem' }) => paddingX};
`;

export default PageContainer;
