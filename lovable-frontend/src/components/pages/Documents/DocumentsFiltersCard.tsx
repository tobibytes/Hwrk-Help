import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchIcon } from 'lucide-react';
import { Box } from '@/components/ui/box';

interface Props {
  searchQuery: string;
  activeTab: string;
  onChangeQuery: (v: string) => void;
  onChangeTab: (v: string) => void;
}

const DocumentsFiltersCard: React.FC<Props> = ({ searchQuery, activeTab, onChangeQuery, onChangeTab }) => (
  <Surface variant="card" padding="md">
    <Stack gap="md">
      <Box className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => onChangeQuery(e.target.value)} className="pl-10" />
      </Box>
      <Tabs value={activeTab} onValueChange={onChangeTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="processed">AI Processed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>
      </Tabs>
    </Stack>
  </Surface>
);

export default DocumentsFiltersCard;

