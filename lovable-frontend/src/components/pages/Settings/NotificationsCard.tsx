import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TestTubeIcon, SendIcon, MailIcon } from 'lucide-react';

interface Template { name: string; description: string; fields: string[] }

interface Props {
  templates: Template[];
  selectedTemplate: string;
  templateVars: string;
  testEmail: string;
  onChangeSelectedTemplate: (v: string) => void;
  onChangeTemplateVars: (v: string) => void;
  onChangeTestEmail: (v: string) => void;
  onSendTemplate: () => void;
  onSendTest: () => void;
}

const NotificationsCard: React.FC<Props> = ({ templates, selectedTemplate, templateVars, testEmail, onChangeSelectedTemplate, onChangeTemplateVars, onChangeTestEmail, onSendTemplate, onSendTest }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="lg">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Email Notifications</h3>
        <p className="text-foreground-secondary">Test email delivery and send templated notifications</p>
      </div>

      <Box className="p-4 rounded-lg border border-border">
        <h4 className="font-medium text-foreground mb-3">Test Email Delivery</h4>
        <Stack gap="md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Test Email Address</label>
            <Input type="email" placeholder="your.email@example.com" value={testEmail} onChange={(e) => onChangeTestEmail(e.target.value)} />
          </div>
          <Button variant="outline" onClick={onSendTest} disabled={!testEmail.trim()}>
            <TestTubeIcon className="h-4 w-4" />
            Send Test Email
          </Button>
        </Stack>
      </Box>

      <div className="p-4 rounded-lg border border-border">
        <h4 className="font-medium text-foreground mb-3">Send Template Email</h4>
        <Stack gap="md">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Template</label>
            <div className="min-w-[240px]">
              <Select value={selectedTemplate} onValueChange={onChangeSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__placeholder__" disabled>Select a template...</SelectItem>
                  {templates.map(t => (
                    <SelectItem key={t.name} value={t.name}>{t.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTemplate && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Template Variables (JSON)</label>
              <Textarea value={templateVars} onChange={(e) => onChangeTemplateVars(e.target.value)} className="font-mono text-sm" rows={4} placeholder='{"student_name": "John", "course_name": "CS 2420"}' />
              <p className="text-xs text-foreground-muted mt-1">Required fields: {templates.find(t => t.name === selectedTemplate)?.fields.join(', ')}</p>
            </div>
          )}

          <Button variant="secondary" onClick={onSendTemplate} disabled={!selectedTemplate || !templateVars.trim()}>
            <SendIcon className="h-4 w-4" />
            Send Template Email
          </Button>
        </Stack>
      </div>

      <Box className="p-4 rounded-lg bg-warning-light">
        <Stack className="flex items-start gap-3">
          <MailIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-warning mb-1">SMTP Configuration</h4>
            <p className="text-sm text-warning-foreground">If SMTP is not configured, emails will be logged to the console instead of being sent. Contact your administrator to set up email delivery.</p>
          </div>
        </Stack>
      </Box>
    </Stack>
  </Surface>
);

export default NotificationsCard;

