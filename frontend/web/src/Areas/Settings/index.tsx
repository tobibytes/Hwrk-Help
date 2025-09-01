import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard, TalvraButton, Tabs, TabList, Tab, TabPanels, TabPanel, Chip, Toaster, Label, Input, Select, Textarea, SectionHeader, PageContainer, Text as UiText, Divider } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { CanvasTokenSettings } from '@/components/CanvasTokenSettings';
import { useEffect, useState } from 'react';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

// Kickoff helper without JSON body/content-type
async function postKickoff<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

export default function SettingsArea() {
  const [syncBusy, setSyncBusy] = useState(false); // kickoff busy
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  // Global job state for full sync
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<null | {
    status: 'pending' | 'running' | 'completed' | 'failed' | string;
    processed: number;
    skipped: number;
    errors: number;
    created_at?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    error_message?: string | null;
  }>(null);

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      // Kick off global async sync
      const res = await postKickoff<{ ok: true; job_id: string; existing?: boolean }>(
        `${API_BASE}/api/canvas/sync/start`
      );
      const jid = res.job_id;
      setJobId(jid);
      try { localStorage.setItem('canvasSyncJob:GLOBAL', JSON.stringify({ job_id: jid, ts: Date.now() })); } catch {}
      setSyncMsg(res.existing ? 'Global sync already running…' : 'Global sync started…');
    } catch (e: any) {
      setSyncMsg(`Sync kickoff failed: ${String(e?.message || e)}`);
    } finally {
      setSyncBusy(false);
    }
  }

  // Restore active job on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('canvasSyncJob:GLOBAL');
      if (raw) {
        const parsed = JSON.parse(raw) as { job_id: string };
        if (parsed?.job_id) setJobId(parsed.job_id);
      }
    } catch {}
  }, []);

  // Poll status when jobId is present
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const s = await fetch(`${API_BASE}/api/canvas/sync/status/${encodeURIComponent(jobId)}`, { credentials: 'include' });
        if (!s.ok) throw new Error('status not ok');
        const data = await s.json();
        if (stopped) return;
        const j = data.job || {};
        setJob({
          status: j.status,
          processed: Number(j.processed || 0),
          skipped: Number(j.skipped || 0),
          errors: Number(j.errors || 0),
          created_at: j.created_at ?? null,
          started_at: j.started_at ?? null,
          finished_at: j.finished_at ?? null,
          error_message: j.error_message ?? null,
        });
        if (j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval);
          try { localStorage.removeItem('canvasSyncJob:GLOBAL'); } catch {}
        }
      } catch (_) {
        clearInterval(interval);
        try { localStorage.removeItem('canvasSyncJob:GLOBAL'); } catch {}
      }
    }, 1500);
    return () => { stopped = true; clearInterval(interval); };
  }, [jobId]);

  async function sendTestReminder() {
    setTestMsg(null);
    try {
      await postJSON(`${API_BASE}/api/notify/test`, { to: testEmail || undefined });
      setTestMsg('Test reminder sent (or logged if SMTP not configured).');
    } catch (e: any) {
      setTestMsg(`Test reminder failed: ${String(e?.message || e)}`);
    }
  }

  const [testEmail, setTestEmail] = useState('');
  const [testMsg, setTestMsg] = useState<string | null>(null);

  // Template send UI state
  const [templates, setTemplates] = useState<Array<{ name: string; description: string; fields: string[] }>>([]);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateTo, setTemplateTo] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [varsJson, setVarsJson] = useState<string>(
    JSON.stringify(
      {
        user_name: "Alex",
        course_name: "BIO 101",
        assignment_name: "Photosynthesis Worksheet",
        due_at: "2025-09-03 10:00",
        assignment_url: "https://canvas.example.com/courses/123/assignments/456",
      },
      null,
      2
    )
  );
  const [templateMsg, setTemplateMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notify/templates`, { credentials: 'include' });
        if (!res.ok) return;
        const j = await res.json();
        if (!cancelled) setTemplates(j.templates || []);
      } catch {}
    })();
    return () => { cancelled = true };
  }, []);

  async function sendTemplated() {
    setTemplateBusy(true);
    setTemplateMsg(null);
    try {
      if (!selectedTemplate) throw new Error('Select a template');
      let vars: any = {};
      try { vars = JSON.parse(varsJson || '{}'); } catch (e) { throw new Error('Vars JSON is invalid'); }
      const body: any = { template: selectedTemplate, vars };
      if (templateTo && templateTo.trim()) body.to = templateTo.trim();
      if (templateSubject && templateSubject.trim()) body.subject = templateSubject.trim();
      await postJSON(`${API_BASE}/api/notify/send-template`, body);
      setTemplateMsg('Templated email sent (or logged if SMTP not configured).');
    } catch (e: any) {
      setTemplateMsg(`Send failed: ${String(e?.message || e)}`);
    } finally {
      setTemplateBusy(false);
    }
  }

  return (
    <TalvraSurface>
      <Toaster>
        <PageContainer>
        <TalvraStack>
<SectionHeader title="Settings" subtitle="Manage Canvas connection, email reminders, templates, and sync." />
          <Divider />

          <Tabs defaultValue="canvas">
            <TalvraCard>
              <TabList>
                <Tab value="canvas">Canvas</Tab>
                <Tab value="reminders">Reminders</Tab>
                <Tab value="templates">Templates</Tab>
                <Tab value="sync">Sync</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="canvas">
                  <TalvraStack>
                    <CanvasTokenSettings />
                  </TalvraStack>
                </TabPanel>

                <TabPanel value="reminders">
                  <TalvraStack>
<Label>
                      <span className="label-text">Test email (optional)</span>
                      <Input
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="you@example.com (leave blank to use server default)"
                        fullWidth
                      />
                    </Label>
                    <TalvraButton onClick={sendTestReminder}>Send test reminder</TalvraButton>
                    {testMsg && <TalvraText>{testMsg}</TalvraText>}
                  </TalvraStack>
                </TabPanel>

                <TabPanel value="templates">
                  <TalvraStack>
<Label>
                      <span className="label-text">Template</span>
                      <Select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        fullWidth
                      >
                        <option value="">Select a template</option>
                        {templates.map((t) => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </Select>
                    </Label>
                    {selectedTemplate && (
                      <UiText color="gray-500">
                        {templates.find((t) => t.name === selectedTemplate)?.description}
                        {' '}Fields: {(templates.find((t) => t.name === selectedTemplate)?.fields || []).join(', ')}
                      </UiText>
                    )}
<Label>
                      <span className="label-text">To (optional)</span>
                      <Input
                        value={templateTo}
                        onChange={(e) => setTemplateTo(e.target.value)}
                        placeholder="student@example.com (uses server default if blank)"
                        fullWidth
                      />
                    </Label>
<Label>
                      <span className="label-text">Subject (optional override)</span>
                      <Input
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        placeholder="Leave blank to use template default"
                        fullWidth
                      />
                    </Label>
<Label>
                      <span className="label-text">Vars (JSON)</span>
                      <Textarea
                        value={varsJson}
                        onChange={(e) => setVarsJson(e.target.value)}
                        rows={8}
                        fullWidth
                      />
                    </Label>
                    <TalvraButton disabled={templateBusy || !selectedTemplate} onClick={sendTemplated}>
                      {templateBusy ? 'Sending…' : 'Send templated email'}
                    </TalvraButton>
                    {templateMsg && <TalvraText>{templateMsg}</TalvraText>}
                  </TalvraStack>
                </TabPanel>

                <TabPanel value="sync">
                  <TalvraStack>
                    <TalvraText as="h3">Canvas sync</TalvraText>
                    <TalvraButton disabled={syncBusy || (job && (job.status === 'pending' || job.status === 'running'))} onClick={syncNow}>
                      {syncBusy ? 'Starting…' : (job && (job.status === 'pending' || job.status === 'running')) ? 'Sync in progress…' : 'Sync now'}
                    </TalvraButton>
                    {syncMsg && <TalvraText>{syncMsg}</TalvraText>}
                    {job && (
                      <TalvraCard>
                        <TalvraStack>
                          <TalvraText>
                            Global sync status: {job.status} {' '}
                            <Chip variant={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'danger' : 'info'}>
                              {job.status}
                            </Chip>
                            {job.status === 'failed' && job.error_message ? ` — ${job.error_message}` : ''}
                          </TalvraText>
                          <UiText color="gray-500">
                            processed {job.processed} • skipped {job.skipped} • errors {job.errors}
                          </UiText>
                        </TalvraStack>
                      </TalvraCard>
                    )}
                  </TalvraStack>
                </TabPanel>
              </TabPanels>
            </TalvraCard>
          </Tabs>

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
        </PageContainer>
      </Toaster>
    </TalvraSurface>
  );
}

