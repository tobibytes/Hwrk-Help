import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme as uiTheme } from '@ui';
import { colors as tokens } from '@constants';
import { QueryClientProvider, createQueryClient } from '@api';

interface AppProviderProps {
  children: ReactNode;
}

const queryClient = createQueryClient();

// Compose app theme from UI theme + shared tokens
const appTheme = {
  ...uiTheme,
  colors: {
    ...uiTheme.colors,
    primary: {
      ...uiTheme.colors.primary,
      50: tokens.blue50,
      600: tokens.blue600,
    },
    gray: {
      ...uiTheme.colors.gray,
      50: tokens.gray50,
      100: tokens.gray100,
    },
  },
};

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <div className="app-root" style={{ width: '100%', minHeight: '100vh' }}>
          {children}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
