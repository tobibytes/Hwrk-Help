import React from 'react';
import { Box } from '@/components/ui/box';

const DocumentAILayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
    <h1 className="text-3xl font-bold text-foreground">AI Outputs: {title}</h1>
    {children}
  </Box>
);

export default DocumentAILayout;

