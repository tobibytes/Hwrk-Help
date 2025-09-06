import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Box } from '@/components/ui/box';
import { TalvraInput as Input } from '@/components/talvra/TalvraInput';
import { SearchIcon } from 'lucide-react';

const CoursesSearchCard: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <Surface variant="card" padding="md">
    <Box className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
      <Input placeholder="Search courses..." value={value} onChange={(e: any) => onChange(e.target.value)} className="pl-10" />
    </Box>
  </Surface>
);

export default CoursesSearchCard;

