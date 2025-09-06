import React from 'react';
import { Stack } from '@/components/ui/stack';
import { Chip } from '@/components/ui/chip';

interface FilterItem { id: string; name: string }

interface Props {
  activeFilters: FilterItem[];
  onRemove: (id: string) => void;
}

const SearchActiveFilters: React.FC<Props> = ({ activeFilters, onRemove }) => {
  if (!activeFilters.length) return null;
  return (
    <Stack className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-foreground-muted">Active filters:</span>
      {activeFilters.map((f) => (
        <Chip key={f.id} variant="primary" size="sm" removable onRemove={() => onRemove(f.id)}>
          {f.name}
        </Chip>
      ))}
    </Stack>
  );
};

export default SearchActiveFilters;

