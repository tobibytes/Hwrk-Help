import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@ui';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  // This will be expanded in future tasks with:
  // - QueryClientProvider (T013)
  // - Other global providers
  
  return (
    <ThemeProvider theme={theme}>
      <div className="app-root" style={{ width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
