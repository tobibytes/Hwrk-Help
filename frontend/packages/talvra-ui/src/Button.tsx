import styled from 'styled-components';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const variantStyles = {
  primary: {
    background: '#2563eb',
    backgroundHover: '#1d4ed8',
    color: '#ffffff',
    border: '1px solid #2563eb',
  },
  secondary: {
    background: '#ffffff',
    backgroundHover: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  ghost: {
    background: 'transparent',
    backgroundHover: '#f3f4f6',
    color: '#374151',
    border: '1px solid transparent',
  },
};

const sizeStyles = {
  sm: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
  },
  md: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
  },
  lg: {
    padding: '1rem 1.5rem',
    fontSize: '1.125rem',
    borderRadius: '0.75rem',
  },
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: all 0.2s ease-in-out;
  
  /* Size styles */
  padding: ${({ size = 'md' }) => sizeStyles[size].padding};
  font-size: ${({ size = 'md' }) => sizeStyles[size].fontSize};
  border-radius: ${({ size = 'md' }) => sizeStyles[size].borderRadius};
  
  /* Variant styles */
  background-color: ${({ variant = 'primary' }) => variantStyles[variant].background};
  color: ${({ variant = 'primary' }) => variantStyles[variant].color};
  border: ${({ variant = 'primary' }) => variantStyles[variant].border};
  
  &:hover:not(:disabled) {
    background-color: ${({ variant = 'primary' }) => variantStyles[variant].backgroundHover};
  }
  
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export default Button;
