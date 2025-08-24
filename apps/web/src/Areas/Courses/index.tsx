import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { Surface, Stack, Text, Link, Card } from '@ui';

export default function CoursesArea() {
  return (
    <Surface padding="xl">
      <Stack gap="lg">
        <Text variant="h1">Courses</Text>
        <Text>This will display the list of courses from Canvas integration.</Text>
        
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
            <Text variant="h3">Coming in Future Tasks</Text>
            <Stack gap="xs">
              <Text>T032: Frontend Courses list page</Text>
              <Text>Canvas integration and course data display</Text>
              <Text>Document management and study aids</Text>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Surface>
  );
}
