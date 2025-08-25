import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { CanvasTokenSettings } from '@/components/CanvasTokenSettings';

export default function SettingsArea() {
  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Settings</TalvraText>

        <TalvraCard>
          <TalvraStack>
            <CanvasTokenSettings />
          </TalvraStack>
        </TalvraCard>

        <TalvraStack>
          <TalvraText as="h2">Navigation</TalvraText>
          <TalvraStack>
            <TalvraLink href={buildPath(FRONT_ROUTES.ADMIN)}>
              {FRONT_ROUTES.ADMIN.name}
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.COURSES)}>
              {FRONT_ROUTES.COURSES.name}
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.SETTINGS)}>
              {FRONT_ROUTES.SETTINGS.name}
            </TalvraLink>
          </TalvraStack>
        </TalvraStack>
      </TalvraStack>
    </TalvraSurface>
  );
}

