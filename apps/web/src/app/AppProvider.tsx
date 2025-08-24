import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@ui';
import { QueryClientProvider, createQueryClient } from '@api';

interface AppProviderProps {
  children: ReactNode;
}

const queryClient = createQueryClient();

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <div className="app-root" style={{ width: '100%', minHeight: '100vh' }}>
          {children}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
