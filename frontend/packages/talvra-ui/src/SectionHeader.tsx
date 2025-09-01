import styled from 'styled-components';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <HeaderRoot>
      <div className="left">
        <h1 className="title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {right && <div className="right">{right}</div>}
    </HeaderRoot>
  );
}

const HeaderRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary[50]} 0%, ${({ theme }) => theme.colors.white} 100%);
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};

  .title {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.gray[900]};
  }

  .subtitle {
    margin: 0.25rem 0 0 0;
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

export default SectionHeader;
