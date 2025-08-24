import styled from 'styled-components';

export interface CardProps {
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

const paddingMap = {
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

const shadowMap = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

export const Card = styled.div<CardProps>`
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: ${({ padding = 'md' }) => paddingMap[padding]};
  box-shadow: ${({ shadow = 'md' }) => shadowMap[shadow]};
  border: ${({ border = true }) => (border ? '1px solid #e5e7eb' : 'none')};
  transition: ${({ hover = false }) => (hover ? 'all 0.2s ease-in-out' : 'none')};
  
  ${({ hover }) =>
    hover &&
    `
    &:hover {
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      transform: translateY(-1px);
    }
  `}
`;

export default Card;
