import type { ReactNode } from 'react';

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  // This will be expanded in future tasks with:
  // - QueryClientProvider (T013)
  // - Theme provider
  // - Other global providers
  
  return (
    <div className="app-root">
      {children}
    </div>
  );
}
