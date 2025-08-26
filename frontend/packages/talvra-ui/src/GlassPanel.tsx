import styled from 'styled-components';
import { type ReactNode, type HTMLAttributes } from 'react';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const GlassPanel = styled.div<GlassPanelProps>`
  position: relative;
  display: block;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  padding: ${({ theme }) => theme.spacing[6]};
`;

export default GlassPanel;

