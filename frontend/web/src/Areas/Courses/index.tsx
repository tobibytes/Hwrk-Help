import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard } from '@ui';
import { useAPI, qk } from '@api';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

interface Course { id: string; name: string; term: string | null }
interface CoursesResponse { ok: true; courses: Course[] }

export default function CoursesArea() {
  const coursesQ = useAPI<CoursesResponse>(qk.courses(), () => fetchJSON(`${API_BASE}/api/canvas/courses`), {
    retry: false,
    refetchOnWindowFocus: true,
  });

  const courses = coursesQ.data?.courses ?? [];

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Courses</TalvraText>
        <TalvraText>Fetched from Canvas integration (token or fixtures).</TalvraText>
        
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

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Your Courses</TalvraText>
            {coursesQ.isLoading && <TalvraText>Loading courses...</TalvraText>}
            {coursesQ.isError && (
              <TalvraText>
                Failed to load courses: {String((coursesQ.error as any)?.message ?? coursesQ.error)}
              </TalvraText>
            )}
            {!coursesQ.isLoading && !coursesQ.isError && (
              <TalvraStack>
                {courses.length === 0 ? (
                  <TalvraText>No courses found.</TalvraText>
                ) : (
                  courses.map((c) => (
                    <TalvraCard key={c.id}>
                      <TalvraStack>
                        <TalvraText as="h4">{c.name}</TalvraText>
                        <TalvraText>ID: {c.id}</TalvraText>
                        {c.term && <TalvraText>Term: {c.term}</TalvraText>}
                      </TalvraStack>
                    </TalvraCard>
                  ))
                )}
              </TalvraStack>
            )}
          </TalvraStack>
        </TalvraCard>
      </TalvraStack>
    </TalvraSurface>
  );
}
