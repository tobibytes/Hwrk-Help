import styled from 'styled-components';

export interface PageSectionProps {
  gap?: 'sm' | 'md' | 'lg';
}

const gapMap = {
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
} as const;

export const PageSection = styled.section<PageSectionProps>`
  display: block;
  margin: 1.25rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ gap = 'md' }) => gapMap[gap]};
`;

export default PageSection;
