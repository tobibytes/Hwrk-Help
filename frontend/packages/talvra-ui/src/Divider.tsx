import styled from 'styled-components';

export interface DividerProps {
  marginY?: 'sm' | 'md' | 'lg';
}

const marginMap = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
} as const;

export const Divider = styled.hr<DividerProps>`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin: ${({ marginY = 'md' }) => `${marginMap[marginY]} 0`};
`;

export default Divider;
