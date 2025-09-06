import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentsEmpty: React.FC<{ showSync?: boolean }> = ({ showSync }) => (
  <Surface variant="card" padding="xl" className="text-center">
    <Stack gap="lg" align="center">
      <div className="p-4 rounded-full bg-background-secondary">
        <FileTextIcon className="h-8 w-8 text-foreground-muted" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
        <p className="text-foreground-secondary">
          Sync your courses to import documents and materials
        </p>
      </div>
      {showSync && (
        <Button variant="hero" size="lg">Sync Courses</Button>
      )}
    </Stack>
  </Surface>
);

export default DocumentsEmpty;

