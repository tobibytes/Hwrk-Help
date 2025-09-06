import React from 'react';
import { Box } from '@/components/ui/box';

const HomeworkLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
    {children}
  </Box>
);

export default HomeworkLayout;
