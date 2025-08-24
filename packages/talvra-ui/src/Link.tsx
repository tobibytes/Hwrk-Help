import styled from 'styled-components';

export interface LinkProps {
  variant?: 'default' | 'subtle' | 'button';
  underline?: 'always' | 'hover' | 'never';
}

const variantStyles = {
  default: {
    color: '#2563eb',
    hoverColor: '#1d4ed8',
  },
  subtle: {
    color: '#374151',
    hoverColor: '#2563eb',
  },
  button: {
    color: '#2563eb',
    hoverColor: '#1d4ed8',
    background: 'transparent',
    hoverBackground: '#eff6ff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
  },
};

export const Link = styled.a<LinkProps>`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${({ variant = 'default' }) => variantStyles[variant].color};
  text-decoration: ${({ underline = 'hover' }) => {
    switch (underline) {
      case 'always': return 'underline';
      case 'never': return 'none';
      default: return 'none';
    }
  }};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  ${({ variant = 'default' }) =>
    variant === 'button' &&
    `
    display: inline-flex;
    align-items: center;
    padding: ${variantStyles.button.padding};
    border-radius: ${variantStyles.button.borderRadius};
    background-color: ${variantStyles.button.background};
  `}
  
  &:hover {
    color: ${({ variant = 'default' }) => variantStyles[variant].hoverColor};
    text-decoration: ${({ underline = 'hover' }) => {
      switch (underline) {
        case 'never': return 'none';
        default: return 'underline';
      }
    }};
    
    ${({ variant = 'default' }) =>
      variant === 'button' &&
      `background-color: ${variantStyles.button.hoverBackground};`}
  }
  
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
`;

export default Link;
