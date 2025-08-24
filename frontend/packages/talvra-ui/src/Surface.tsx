import styled from 'styled-components';

export interface SurfaceProps {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'gray-50' | 'gray-100' | 'blue-50';
  radius?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

const backgroundMap = {
  white: '#ffffff',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'blue-50': '#eff6ff',
};

const radiusMap = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
};

const shadowMap = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

export const Surface = styled.div<SurfaceProps>`
  padding: ${({ padding = 'md' }) => paddingMap[padding]};
  background-color: ${({ background = 'white' }) => backgroundMap[background]};
  border-radius: ${({ radius = 'md' }) => radiusMap[radius]};
  box-shadow: ${({ shadow = 'none' }) => shadowMap[shadow]};
`;

export default Surface;
