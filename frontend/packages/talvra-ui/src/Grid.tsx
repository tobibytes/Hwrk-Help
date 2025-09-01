import styled from 'styled-components';

export interface GridProps {
  minCol?: number; // min column width in px
  gap?: 'sm' | 'md' | 'lg';
}

const gapMap = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
} as const;

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${({ minCol = 260 }) => `repeat(auto-fill, minmax(${minCol}px, 1fr))`};
  gap: ${({ gap = 'md' }) => gapMap[gap]};
`;

export default Grid;
