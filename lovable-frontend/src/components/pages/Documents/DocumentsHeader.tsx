import React from 'react';

const DocumentsHeader: React.FC = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Documents</h1>
      <p className="text-foreground-secondary">Browse and manage your course materials</p>
    </div>
  </div>
);

export default DocumentsHeader;

