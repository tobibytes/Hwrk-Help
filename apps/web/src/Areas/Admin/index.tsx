import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard } from '@ui';

export default function AdminArea() {
  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Talvra Admin</TalvraText>
        <TalvraText>Welcome to the Talvra learning platform administration area.</TalvraText>
        
        <TalvraStack>
          <TalvraText as="h2">Navigation</TalvraText>
          <TalvraStack>
            <TalvraLink href={buildPath(FRONT_ROUTES.ADMIN)}>
              {FRONT_ROUTES.ADMIN.name}
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.COURSES)}>
              {FRONT_ROUTES.COURSES.name}
            </TalvraLink>
          </TalvraStack>
        </TalvraStack>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Phase 1: Frontend Base</TalvraText>
            <TalvraText>✅ Task T010: Scaffold Vite React app and structure</TalvraText>
            <TalvraStack>
              <TalvraText>✅ Created Vite React TypeScript app</TalvraText>
              <TalvraText>✅ Added path aliases for @/, @ui, @hooks, @constants, @routes, @api</TalvraText>
              <TalvraText>✅ Created Areas folder structure</TalvraText>
              <TalvraText>✅ Added AppProvider, AppRoutes, and routes.ts</TalvraText>
              <TalvraText>✅ Admin page renders successfully</TalvraText>
            </TalvraStack>
          </TalvraStack>
        </TalvraCard>
      </TalvraStack>
    </TalvraSurface>
  );
}
