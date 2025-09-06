import React from 'react';
import DocumentsLayout from '@/components/pages/Documents/DocumentsLayout';
import DocumentsHeader from '@/components/pages/Documents/DocumentsHeader';
import DocumentsFiltersCard from '@/components/pages/Documents/DocumentsFiltersCard';
import DocumentsList from '@/components/pages/Documents/DocumentsList';
import DocumentsEmpty from '@/components/pages/Documents/DocumentsEmpty';
import { useDocumentsPage } from '@/hooks/pages/useDocumentsPage';

export default function Index() {
  const { searchQuery, setSearchQuery, activeTab, setActiveTab, filtered } = useDocumentsPage();

  return (
    <DocumentsLayout>
      <DocumentsHeader />
      <DocumentsFiltersCard searchQuery={searchQuery} activeTab={activeTab} onChangeQuery={setSearchQuery} onChangeTab={setActiveTab} />
      {filtered.length > 0 ? (
        <DocumentsList documents={filtered as any} />
      ) : (
        <DocumentsEmpty showSync={!searchQuery} />
      )}
    </DocumentsLayout>
  );
}

