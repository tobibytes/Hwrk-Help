import React, { useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

const Settings = () => {
  const [canvasToken, setCanvasToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [templateVars, setTemplateVars] = useState('{}');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Mock data
  const templates = [
    {
      name: 'study_reminder',
      description: 'Study session reminder',
      fields: ['student_name', 'course_name', 'topic']
    },
    {
      name: 'assignment_due',
      description: 'Assignment due date notification',
      fields: ['assignment_name', 'due_date', 'course_name']
    }
  ];

  const handleCanvasConnect = () => {
    if (canvasToken.trim()) {
      setIsTokenValid(true);
    }
  };

  const handleGlobalSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  const handleTestEmail = () => {
    console.log('Sending test email to:', testEmail);
  };

  const handleSendTemplate = () => {
    try {
      JSON.parse(templateVars);
      console.log('Sending template:', selectedTemplate, 'with vars:', templateVars);
    } catch (error) {
      alert('Invalid JSON in template variables');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-foreground-secondary">
          Configure your account and application preferences
        </p>
      </div>

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
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
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
              </div>

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
              <div className="p-4 rounded-lg bg-primary-light">
                <h4 className="font-medium text-primary mb-2">How to get your Canvas API token:</h4>
                <ol className="text-sm text-primary space-y-1 list-decimal list-inside">
                  <li>Log into your Canvas account</li>
                  <li>Go to Account → Settings</li>
                  <li>Scroll down to "Approved Integrations"</li>
                  <li>Click "+ New Access Token"</li>
                  <li>Enter "Talvra" as the purpose</li>
                  <li>Copy the generated token and paste it above</li>
                </ol>
              </div>
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
              <div className="p-4 rounded-lg border border-border">
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
              </div>

              {/* Template Email */}
              <div className="p-4 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-3">Send Template Email</h4>
                <Stack gap="md">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input-border bg-background"
                    >
                      <option value="">Select a template...</option>
                      {templates.map(template => (
                        <option key={template.name} value={template.name}>
                          {template.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Template Variables (JSON)
                      </label>
                      <textarea
                        value={templateVars}
                        onChange={(e) => setTemplateVars(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input-border bg-background font-mono text-sm"
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
              <div className="p-4 rounded-lg bg-warning-light">
                <div className="flex items-start gap-3">
                  <MailIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning mb-1">SMTP Configuration</h4>
                    <p className="text-sm text-warning-foreground">
                      If SMTP is not configured, emails will be logged to the console instead of being sent.
                      Contact your administrator to set up email delivery.
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="p-4 rounded-lg bg-background-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Sync Status</h4>
                    <p className="text-sm text-foreground-secondary">
                      {isSyncing ? 'Synchronizing...' : 'Last sync: 2 hours ago'}
                    </p>
                  </div>
                  {isSyncing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      <Chip variant="primary" size="sm">Syncing</Chip>
                    </div>
                  ) : (
                    <Chip variant="success" size="sm">Up to date</Chip>
                  )}
                </div>
              </div>

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
    </div>
  );
};

export default Settings;