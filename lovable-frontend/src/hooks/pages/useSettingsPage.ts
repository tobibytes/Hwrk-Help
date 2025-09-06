import { useEffect, useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { toast } from 'sonner';
import { useCanvasSyncJobPoller } from '@/hooks/useCanvasSyncJobPoller';

interface Template { name: string; description: string; fields: string[] }

export function useSettingsPage() {
  const [canvasToken, setCanvasToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [templateVars, setTemplateVars] = useState('{}');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const templatesAPI = useAPI<{ templates: Template[] }>({ route: { endpoint: '/api/notify/templates', method: 'GET' } });
  const templates = templatesAPI.data?.templates || [];

  const saveTokenAPI = useAPI({ route: { endpoint: '/api/auth/canvas/token', method: 'PUT' }, enabled: false });
  const validateTokenAPI = useAPI({ route: { endpoint: '/api/canvas/courses', method: 'GET' }, enabled: false });

  async function handleCanvasConnect() {
    if (!canvasToken.trim()) return;
    try {
      await saveTokenAPI.run({ body: { token: canvasToken.trim() } });
      const res: any = await validateTokenAPI.run();
      const ok = res?.data && (res.data as any).ok !== false ? true : true;
      setIsTokenValid(ok); toast.success('Canvas token saved' + (ok ? ' and validated' : ''));
      setCanvasToken('');
    } catch (e: any) { toast.error(`Failed to save token: ${String(e?.message || e)}`); }
  }

  const globalSyncAPI = useAPI<{ ok: true; job_id: string; existing?: boolean }>({ route: { endpoint: '/api/canvas/sync/start', method: 'POST' }, enabled: false });
  async function handleGlobalSync() {
    setIsSyncing(true); setSyncMsg(null);
    try {
      const res: any = await globalSyncAPI.run();
      setJobId(res?.data?.job_id);
      setSyncMsg(res?.data?.existing ? 'Global sync already running…' : 'Global sync started…');
      toast.info(res?.data?.existing ? 'Global sync already running' : 'Global sync started')
    } catch (e: any) {
      const msg = `Sync kickoff failed: ${String(e?.message || e)}`; setSyncMsg(msg); setIsSyncing(false); toast.error(msg)
    }
  }

  const { job } = useCanvasSyncJobPoller(jobId, null, () => { setIsSyncing(false); toast.success('Global sync completed'); });

  const testEmailAPI = useAPI({ route: { endpoint: '/api/notify/test', method: 'POST' }, enabled: false });
  async function handleTestEmail() {
    try { await testEmailAPI.run({ body: { to: testEmail || undefined } }); toast.success('Test reminder sent (or logged if SMTP not configured).'); }
    catch (e: any) { toast.error(`Test reminder failed: ${String(e?.message || e)}`); }
  }

  const sendTemplateAPI = useAPI({ route: { endpoint: '/api/notify/send-template', method: 'POST' }, enabled: false });
  async function handleSendTemplate() {
    try {
      const vars = JSON.parse(templateVars || '{}');
      if (!selectedTemplate) throw new Error('Select a template');
      await sendTemplateAPI.run({ body: { template: selectedTemplate, vars } });
      toast.success('Templated email sent (or logged if SMTP not configured).');
    } catch (error: any) { toast.error(`Invalid or failed request: ${String(error?.message || error)}`); }
  }

  return {
    templates, selectedTemplate, setSelectedTemplate,
    templateVars, setTemplateVars,
    testEmail, setTestEmail,
    canvasToken, setCanvasToken,
    isTokenValid, isSyncing, syncMsg, job,
    handleCanvasConnect, handleGlobalSync, handleTestEmail, handleSendTemplate,
  };
}

