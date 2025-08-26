import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { TalvraSurface, TalvraStack, TalvraText, TalvraButton, GlassPanel } from '@ui';
import { type ReactNode } from 'react';
import { FRONT_ROUTES, buildPath } from '@/app/routes';

interface AppLayoutProps {
  children: ReactNode;
}

const HeaderBar = styled(GlassPanel)`
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 0.75rem 1rem;
  border-radius: 16px;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Brand = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

const BrandText = styled(TalvraText)`
  background: linear-gradient(90deg, #111827, #4b5563);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NavItem = styled(NavLink)`
  text-decoration: none;
  color: #374151;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  transition: all 160ms ease;

  &.active {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <TalvraSurface>
      <Container>
        <HeaderBar>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Brand to={buildPath(FRONT_ROUTES.ADMIN)}>
              <BrandText as="h3">Talvra</BrandText>
            </Brand>
            <Nav>
              <NavItem to={buildPath(FRONT_ROUTES.ADMIN)} end>Dashboard</NavItem>
              <NavItem to={buildPath(FRONT_ROUTES.COURSES)}>Courses</NavItem>
              <NavItem to={buildPath(FRONT_ROUTES.DOCUMENTS)}>Documents</NavItem>
              <NavItem to={buildPath(FRONT_ROUTES.SETTINGS)}>Settings</NavItem>
            </Nav>
            <div style={{ display: 'flex', gap: 8 }}>
              <TalvraButton as={NavLink} to={buildPath(FRONT_ROUTES.COURSES)}>Get started</TalvraButton>
            </div>
          </div>
        </HeaderBar>
      </Container>

      <Container>
        <div style={{ padding: '1.25rem 0 2rem' }}>{children}</div>
      </Container>
    </TalvraSurface>
  );
}

