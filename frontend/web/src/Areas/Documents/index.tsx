import { TalvraSurface, TalvraStack, TalvraText, TalvraButton, TalvraCard, SectionHeader, Grid, PageContainer, PageSection, Text as UiText } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { useEffect, useState } from 'react';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

interface DocRow {
  doc_id: string;
  title: string | null;
  course_canvas_id: string | null;
  module_canvas_id: string | null;
  module_item_canvas_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export default function DocumentsArea() {
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const data = await fetchJSON<{ ok: true; documents: DocRow[] }>(`${API_BASE}/api/canvas/documents?limit=100`);
        if (!cancelled) setDocs(data.documents);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => { cancelled = true };
  }, []);

  return (
    <TalvraSurface>
<PageContainer>
        <TalvraStack>
<SectionHeader title="Documents" subtitle="Recently ingested content and outputs." />
        {error && <TalvraText>Error loading documents: {error}</TalvraText>}

        <PageSection>
        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Recent documents</TalvraText>
            {docs === null ? (
              <TalvraText>Loading…</TalvraText>
            ) : docs.length === 0 ? (
              <TalvraText>No documents found yet. Try Settings → Sync now after saving your Canvas token.</TalvraText>
            ) : (
<Grid>
                {docs.map((d) => (
                  <TalvraCard key={d.doc_id}>
                    <TalvraStack>
                      <TalvraText as="h4">{d.title ?? d.doc_id}</TalvraText>
                      <TalvraStack>
                        <TalvraButton as="a" href={`/documents/${encodeURIComponent(d.doc_id)}`} variant="ghost">Open</TalvraButton>
                        <TalvraButton as="a" href={`/documents/${encodeURIComponent(d.doc_id)}/ai`} variant="ghost">AI</TalvraButton>
                        <TalvraButton as="a" href={`/documents/${encodeURIComponent(d.doc_id)}/video`} variant="ghost">Video</TalvraButton>
                      </TalvraStack>
                      <UiText color="gray-500">
                        {d.mime_type ?? 'unknown'} • {d.size_bytes ? `${d.size_bytes} bytes` : 'size unknown'} • {new Date(d.created_at).toLocaleString()}
                      </UiText>
                    </TalvraStack>
                  </TalvraCard>
                ))}
              </Grid>
            )}
          </TalvraStack>
        </TalvraCard>
        </PageSection>

        <PageSection>
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
        </PageSection>

        <PageSection>
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
            <TalvraLink href={buildPath(FRONT_ROUTES.SEARCH)}>
              {FRONT_ROUTES.SEARCH.name}
            </TalvraLink>
          </TalvraStack>
        </TalvraStack>
        </PageSection>
      </TalvraStack>
      </PageContainer>
    </TalvraSurface>
  );
}

