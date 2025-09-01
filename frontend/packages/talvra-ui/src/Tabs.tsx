import styled from 'styled-components';
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsCtx = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
}

export function Tabs({ defaultValue, value, onValueChange, children }: TabsProps) {
  const [internal, setInternal] = useState<string>(defaultValue ?? '');
  const val = value !== undefined ? value : internal;
  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);
    if (value === undefined) setInternal(v);
  };
  const ctx = useMemo(() => ({ value: val, setValue }), [val]);
  return <TabsCtx.Provider value={ctx}>{children}</TabsCtx.Provider>;
}

export function useTabsCtx() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

export const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children, ...rest }: TabProps) {
  const { value: current, setValue } = useTabsCtx();
  const active = current === value;
  return (
    <StyledTab
      type="button"
      aria-selected={active}
      data-active={active ? 'true' : 'false'}
      onClick={() => setValue(value)}
      {...rest}
    >
      {children}
    </StyledTab>
  );
}

const StyledTab = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  color: ${({ theme }) => theme.colors.gray[700]};
  cursor: pointer;

  &[data-active='true'] {
    color: ${({ theme }) => theme.colors.primary[700]};
    border: 1px solid ${({ theme }) => theme.colors.gray[200]};
    border-bottom-color: white;
    background: ${({ theme }) => theme.colors.white};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary[800]};
  }
`;

export const TabPanels = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
`;

export interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const { value: current } = useTabsCtx();
  if (current !== value) return null;
  return <div>{children}</div>;
}
