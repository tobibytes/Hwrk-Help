import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';

export default function DocumentsArea() {
  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Documents</TalvraText>
        <TalvraText>After you start ingestion, processed documents will appear here.</TalvraText>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">How to process a file</TalvraText>
            <TalvraText>
              1) Copy a PDF/DOCX into the ingestion container at /tmp/file.pdf
            </TalvraText>
            <TalvraText>
              2) POST /api/ingestion/start with {{ file:"/tmp/file.pdf", doc_id:"mydoc" }}
            </TalvraText>
            <TalvraText>
              3) Open the detail page at /documents/mydoc to view outputs
            </TalvraText>
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

