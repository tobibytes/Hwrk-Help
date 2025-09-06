import React from 'react';
import { Box } from '@/components/ui/box';

interface Props { children: React.ReactNode; title: string }

const DocumentDetailLayout: React.FC<Props> = ({ children, title }) => (
  <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
    <h1 className="text-3xl font-bold text-foreground">Document: {title}</h1>
    {children}
  </Box>
);

export default DocumentDetailLayout;

