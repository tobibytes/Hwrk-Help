import React from 'react';
import { Box } from '@/components/ui/box';

interface Props { children: React.ReactNode }

const DocumentsLayout: React.FC<Props> = ({ children }) => (
  <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">{children}</Box>
);

export default DocumentsLayout;

