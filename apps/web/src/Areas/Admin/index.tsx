import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { Surface, Stack, Text, Link, Card } from '@ui';

export default function AdminArea() {
  return (
    <Surface padding="xl">
      <Stack gap="lg">
        <Text variant="h1">Talvra Admin</Text>
        <Text>Welcome to the Talvra learning platform administration area.</Text>
        
        <Stack gap="sm">
          <Text variant="h2">Navigation</Text>
          <Stack gap="xs">
            <Link href={buildPath(FRONT_ROUTES.ADMIN)}>
              {FRONT_ROUTES.ADMIN.name}
            </Link>
            <Link href={buildPath(FRONT_ROUTES.COURSES)}>
              {FRONT_ROUTES.COURSES.name}
            </Link>
          </Stack>
        </Stack>

        <Card padding="sm">
          <Stack gap="md">
            <Text variant="h3">Phase 1: Frontend Base</Text>
            <Text>✅ Task T010: Scaffold Vite React app and structure</Text>
            <Stack gap="xs">
              <Text>✅ Created Vite React TypeScript app</Text>
              <Text>✅ Added path aliases for @/, @ui, @hooks, @constants, @routes, @api</Text>
              <Text>✅ Created Areas folder structure</Text>
              <Text>✅ Added AppProvider, AppRoutes, and routes.ts</Text>
              <Text>✅ Admin page renders successfully</Text>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Surface>
  );
}
