import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard } from '@ui';

export default function CoursesArea() {
  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Courses</TalvraText>
        <TalvraText>This will display the list of courses from Canvas integration.</TalvraText>
        
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
            <TalvraText as="h3">Coming in Future Tasks</TalvraText>
            <TalvraStack>
              <TalvraText>T032: Frontend Courses list page</TalvraText>
              <TalvraText>Canvas integration and course data display</TalvraText>
              <TalvraText>Document management and study aids</TalvraText>
            </TalvraStack>
          </TalvraStack>
        </TalvraCard>
      </TalvraStack>
    </TalvraSurface>
  );
}
