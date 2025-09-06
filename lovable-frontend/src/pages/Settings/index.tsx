import React from 'react';
import SettingsLayout from '@/components/pages/Settings/SettingsLayout';
import SettingsHeader from '@/components/pages/Settings/SettingsHeader';
import CanvasIntegrationCard from '@/components/pages/Settings/CanvasIntegrationCard';
import NotificationsCard from '@/components/pages/Settings/NotificationsCard';
import SyncSettingsCard from '@/components/pages/Settings/SyncSettingsCard';
import { useSettingsPage } from '@/hooks/pages/useSettingsPage';

export default function Index() {
  const {
    templates, selectedTemplate, setSelectedTemplate,
    templateVars, setTemplateVars,
    testEmail, setTestEmail,
    canvasToken, setCanvasToken,
    isTokenValid, isSyncing, syncMsg, job,
    handleCanvasConnect, handleGlobalSync, handleTestEmail, handleSendTemplate,
  } = useSettingsPage();

  return (
    <SettingsLayout>
      <SettingsHeader />
      <CanvasIntegrationCard isTokenValid={isTokenValid} canvasToken={canvasToken} onChangeToken={setCanvasToken} onConnect={handleCanvasConnect} />
      <NotificationsCard
        templates={templates}
        selectedTemplate={selectedTemplate}
        templateVars={templateVars}
        testEmail={testEmail}
        onChangeSelectedTemplate={setSelectedTemplate}
        onChangeTemplateVars={setTemplateVars}
        onChangeTestEmail={setTestEmail}
        onSendTemplate={handleSendTemplate}
        onSendTest={handleTestEmail}
      />
      <SyncSettingsCard isSyncing={isSyncing} syncMsg={syncMsg} job={job as any} isTokenValid={isTokenValid} onStartGlobalSync={handleGlobalSync} />
    </SettingsLayout>
  );
}

