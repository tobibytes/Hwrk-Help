# Styling and Theming

Library: styled-components

Theme System
- Consistent styling via styled-components and a shared theme
- Theme constants in `packages/talvra-constants`
- All styling goes through the theme system

Theme Structure
```ts
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px'
    }
  }
};
```

Usage
```tsx
import styled from 'styled-components';

const StyledCard = styled.div`
  background: ${props => props.theme.colors.light};
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  font-family: ${props => props.theme.typography.fontFamily};
`;
```

Rules
- No inline styles
- Use theme variables for all colors, spacing, and typography
- Consistent component styling patterns
- Responsive design through theme breakpoints
