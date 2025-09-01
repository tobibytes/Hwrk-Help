import styled, { keyframes } from 'styled-components';
import React, { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
}

interface ToastItem extends Required<ToastOptions> { id: string }

interface ToastContextValue {
  notify: (opts: ToastOptions) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <Toaster>');
  return ctx.notify;
}

export interface ToasterProps {
  children?: ReactNode;
  placement?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export function Toaster({ children, placement = 'bottom-right' }: ToasterProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const notify = (opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      title: opts.title ?? '',
      description: opts.description ?? '',
      variant: opts.variant ?? 'default',
      duration: opts.duration ?? 3000,
    };
    setItems((prev) => [...prev, item]);
    timers.current[id] = setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }, item.duration);
  };

  const ctx = useMemo(() => ({ notify }), []);

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <ToastViewport data-placement={placement} role="status" aria-live="polite">
        {items.map((t) => (
          <ToastCard key={t.id} data-variant={t.variant}>
            {t.title && <strong>{t.title}</strong>}
            {t.description && <div className="desc">{t.description}</div>}
          </ToastCard>
        ))}
      </ToastViewport>
    </ToastCtx.Provider>
  );
}

const slideIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ToastViewport = styled.div`
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;

  &[data-placement='bottom-right'] { right: 12px; bottom: 12px; }
  &[data-placement='top-right'] { right: 12px; top: 12px; }
  &[data-placement='bottom-left'] { left: 12px; bottom: 12px; }
  &[data-placement='top-left'] { left: 12px; top: 12px; }
`;

const ToastCard = styled.div`
  min-width: 260px;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[900]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-left-width: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 10px 12px;
  animation: ${slideIn} 150ms ease-out;

  & > strong { display: block; margin-bottom: 4px; }
  & > .desc { color: ${({ theme }) => theme.colors.gray[600]}; }

  &[data-variant='success'] { border-left-color: ${({ theme }) => theme.colors.green[600]}; }
  &[data-variant='error'] { border-left-color: ${({ theme }) => theme.colors.red[600]}; }
  &[data-variant='warning'] { border-left-color: ${({ theme }) => theme.colors.amber[600]}; }
  &[data-variant='info'] { border-left-color: ${({ theme }) => theme.colors.blue[600]}; }
`;
