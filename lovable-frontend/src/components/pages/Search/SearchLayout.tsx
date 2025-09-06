import React from 'react';
import { Box } from '@/components/ui/box';

interface Props { children: React.ReactNode }

const SearchLayout: React.FC<Props> = ({ children }) => {
  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {children}
    </Box>
  );
};

export default SearchLayout;

