import React from 'react';
import { Box } from '@/components/ui/box';

const CoursesLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">{children}</Box>
);

export default CoursesLayout;

