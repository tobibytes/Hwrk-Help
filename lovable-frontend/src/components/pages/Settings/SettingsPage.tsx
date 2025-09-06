import React, { useEffect, useMemo, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Box } from '@/components/ui/box';
import {
  SettingsIcon,
  KeyIcon,
  BellIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SendIcon,
  TestTubeIcon,
  MailIcon
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { useAPI } from '@/lib/useAPI';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = () => {
  const [canvasToken, setCanvasToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [templateVars, setTemplateVars] = useState('{}');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState<Array<{ name: string; description: string; fields: string[] }>>([]);

  const templatesAPI = useAPI<{ templates: Array<{ name: string; description: string; fields: string[] }> }>({ route: { endpoint: '/api/notify/templates', method: 'GET' } });
  useEffect(() => {
    if (templatesAPI.data?.templates) setTemplates(templatesAPI.data.templates);
  }, [templatesAPI.data]);

  const saveTokenAPI = useAPI({ route: { endpoint: '/api/auth/canvas/token', method: 'PUT' }, enabled: false });
  const validateTokenAPI = useAPI({ route: { endpoint: '/api/canvas/courses', method: 'GET' }, enabled: false });
  const handleCanvasConnect = async () => {
    if (!canvasToken.trim()) return;
    try {
      await saveTokenAPI.run({ body: { token: canvasToken.trim() } });
      const res: any = await validateTokenAPI.run();
      const ok = res?.data && (res.data as any).ok !== false ? true : true;
      setIsTokenValid(ok);
      toast.success('Canvas token saved' + (ok ? ' and validated' : ''));
      setCanvasToken('');
    } catch (e: any) {
      toast.error(`Failed to save token: ${String(e?.message || e)}`);
    }
  };

  const globalSyncAPI = useAPI<{ ok: true; job_id: string; existing?: boolean }>({ route: { endpoint: '/api/canvas/sync/start', method: 'POST' }, enabled: false });
  const handleGlobalSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const res: any = await globalSyncAPI.run();
      setJobId(res?.data?.job_id);
      setSyncMsg(res?.data?.existing ? 'Global sync already running…' : 'Global sync started…');
      toast.info(res?.data?.existing ? 'Global sync already running' : 'Global sync started')
    } catch (e: any) {
      const msg = `Sync kickoff failed: ${String(e?.message || e)}`;
      setSyncMsg(msg);
      setIsSyncing(false);
      toast.error(msg)
    }
  };

  const syncStatusAPI = useAPI<{ ok: true; job: any }>({ route: { endpoint: jobId ? `/api/canvas/sync/status/${encodeURIComponent(jobId)}` : '/noop', method: 'GET' }, enabled: !!jobId, options: { refetchInterval: jobId ? 1500 : false } as any });
  useEffect(() => {
    const j = (syncStatusAPI.data as any)?.job || {};
    if (!jobId || !j?.status) return;
    if (j.status === 'completed' || j.status === 'failed') {
      setIsSyncing(false);
      const msg = j.status === 'completed' ? 'Sync completed.' : `Sync failed${j.error_message ? `: ${j.error_message}` : ''}`;
      setSyncMsg(msg);
      if (j.status === 'completed') toast.success('Global sync completed'); else toast.error(msg);
    }
  }, [jobId, syncStatusAPI.data]);

  const testEmailAPI = useAPI({ route: { endpoint: '/api/notify/test', method: 'POST' }, enabled: false });
  const handleTestEmail = async () => {
    try {
      await testEmailAPI.run({ body: { to: testEmail || undefined } });
      toast.success('Test reminder sent (or logged if SMTP not configured).');
    } catch (e: any) {
      toast.error(`Test reminder failed: ${String(e?.message || e)}`);
    }
  };

  const sendTemplateAPI = useAPI({ route: { endpoint: '/api/notify/send-template', method: 'POST' }, enabled: false });
  const handleSendTemplate = async () => {
    try {
      const vars = JSON.parse(templateVars || '{}');
      if (!selectedTemplate) throw new Error('Select a template');
      await sendTemplateAPI.run({ body: { template: selectedTemplate, vars } });
      toast.success('Templated email sent (or logged if SMTP not configured).');
    } catch (error: any) {
      toast.error(`Invalid or failed request: ${String(error?.message || error)}`);
    }
  };

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <Box>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-foreground-secondary">
          Configure your account and application preferences
        </p>
      </Box>

      <Tabs defaultValue="canvas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="canvas">
            <KeyIcon className="h-4 w-4" />
            Canvas Integration
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellIcon className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="sync">
            <RefreshCwIcon className="h-4 w-4" />
            Sync Settings
          </TabsTrigger>
        </TabsList>

        {/* Canvas Integration Tab */}
        <TabsContent value="canvas">
          <Surface variant="card" padding="lg">
            <Stack gap="lg">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Canvas API Configuration
                </h3>
                <p className="text-foreground-secondary">
                  Connect your Canvas account to import courses and materials
                </p>
              </div>

              {/* Token Status */}
              <Stack className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
                {isTokenValid ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">Connected</p>
                      <p className="text-sm text-foreground-secondary">
                        Canvas API token is valid and active
                      </p>
                    </div>
                    <Chip variant="success" size="sm">Connected</Chip>
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium text-foreground">Not Connected</p>
                      <p className="text-sm text-foreground-secondary">
                        Enter your Canvas API token to get started
                      </p>
                    </div>
                    <Chip variant="warning" size="sm">Disconnected</Chip>
                  </>
                )}
              </Stack>

              {/* Token Input */}
              <Stack gap="md">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Canvas API Token
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your Canvas API token..."
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                  />
                  <p className="text-xs text-foreground-muted mt-1">
                    You can generate an API token in your Canvas Account Settings
                  </p>
                </div>
                
                <Button
                  variant="default"
                  onClick={handleCanvasConnect}
                  disabled={!canvasToken.trim()}
                >
                  <KeyIcon className="h-4 w-4" />
                  {isTokenValid ? 'Update Token' : 'Connect Canvas'}
                </Button>
              </Stack>

              {/* Instructions */}
              <Box className="p-4 rounded-lg bg-primary-light">
                <h4 className="font-medium text-primary mb-2">How to get your Canvas API token:</h4>
                <ol className="text-sm text-primary space-y-1 list-decimal list-inside">
                  <li>Log into your Canvas account</li>
                  <li>Go to Account → Settings</li>
                  <li>Scroll down to "Approved Integrations"</li>
                  <li>Click "+ New Access Token"</li>
                  <li>Enter "Talvra" as the purpose</li>
                  <li>Copy the generated token and paste it above</li>
                </ol>
              </Box>
            </Stack>
          </Surface>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Surface variant="card" padding="lg">
            <Stack gap="lg">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Email Notifications
                </h3>
                <p className="text-foreground-secondary">
                  Test email delivery and send templated notifications
                </p>
              </div>

              {/* Test Email */}
              <Box className="p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-3">Test Email Delivery</h4>
                <Stack gap="md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Test Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTestEmail}
                    disabled={!testEmail.trim()}
                  >
                    <TestTubeIcon className="h-4 w-4" />
                    Send Test Email
                  </Button>
                </Stack>
              </Box>

              {/* Template Email */}
              <div className="p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-3">Send Template Email</h4>
                <Stack gap="md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Template
                    </label>
                    <div className="min-w-[240px]">
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="__placeholder__" disabled>Select a template...</SelectItem>
                          {templates.map(template => (
                            <SelectItem key={template.name} value={template.name}>
                              {template.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Template Variables (JSON)
                      </label>
                      <Textarea
                        value={templateVars}
                        onChange={(e) => setTemplateVars(e.target.value)}
                        className="font-mono text-sm"
                        rows={4}
                        placeholder='{"student_name": "John", "course_name": "CS 2420"}'
                      />
                      <p className="text-xs text-foreground-muted mt-1">
                        Required fields: {templates.find(t => t.name === selectedTemplate)?.fields.join(', ')}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    onClick={handleSendTemplate}
                    disabled={!selectedTemplate || !templateVars.trim()}
                  >
                    <SendIcon className="h-4 w-4" />
                    Send Template Email
                  </Button>
                </Stack>
              </div>

              {/* SMTP Notice */}
              <Box className="p-4 rounded-lg bg-warning-light">
                <Stack className="flex items-start gap-3">
                  <MailIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning mb-1">SMTP Configuration</h4>
                    <p className="text-sm text-warning-foreground">
                      If SMTP is not configured, emails will be logged to the console instead of being sent.
                      Contact your administrator to set up email delivery.
                    </p>
                  </div>
                </Stack>
              </Box>
            </Stack>
          </Surface>
        </TabsContent>

        {/* Sync Settings Tab */}
        <TabsContent value="sync">
          <Surface variant="card" padding="lg">
            <Stack gap="lg">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Global Sync Settings
                </h3>
                <p className="text-foreground-secondary">
                  Manage synchronization of all your Canvas courses and materials
                </p>
              </div>

              {/* Sync Status */}
              <Box className="p-4 rounded-lg bg-background-secondary">
                <Stack className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Sync Status</h4>
                    <p className="text-sm text-foreground-secondary">
                      {isSyncing ? 'Synchronizing…' : (syncMsg || 'Idle')}
                    </p>
                  </div>
                  {isSyncing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      <Chip variant="primary" size="sm">Syncing</Chip>
                    </div>
                  ) : (
                    <Chip variant="success" size="sm">Ready</Chip>
                  )}
                </Stack>
              </Box>

              {/* Sync Controls */}
              <Stack gap="md">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleGlobalSync}
                  disabled={isSyncing || !isTokenValid}
                  className="w-full"
                >
                  {isSyncing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Syncing All Courses...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="h-5 w-5" />
                      Start Global Sync
                    </>
                  )}
                </Button>

                {!isTokenValid && (
                  <p className="text-center text-sm text-foreground-muted">
                    Connect your Canvas account first to enable sync
                  </p>
                )}
              </Stack>

              {/* Sync Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Sync Options</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div>
                      <p className="font-medium text-foreground">Sync Course Materials</p>
                      <p className="text-sm text-foreground-secondary">
                        Import files, pages, and other course content
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <div>
                      <p className="font-medium text-foreground">Sync Assignments</p>
                      <p className="text-sm text-foreground-secondary">
                        Import assignment details and due dates
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <div>
                      <p className="font-medium text-foreground">Auto-generate AI Summaries</p>
                      <p className="text-sm text-foreground-secondary">
                        Automatically create notes and flashcards for new content
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </Stack>
          </Surface>
        </TabsContent>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;

