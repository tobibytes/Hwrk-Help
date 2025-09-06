import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { BookOpenIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CoursesEmpty: React.FC<{ hasQuery: boolean }> = ({ hasQuery }) => (
  <Surface variant="card" padding="xl" className="text-center">
    <Stack gap="lg" align="center">
      <div className="p-4 rounded-full bg-background-secondary">
        <BookOpenIcon className="h-8 w-8 text-foreground-muted" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-foreground">{hasQuery ? 'No courses found' : 'No courses yet'}</h3>
        {hasQuery ? (
          <p className="text-foreground-secondary">Try adjusting your search terms</p>
        ) : (
          <p className="text-foreground-secondary">Connect your Canvas account to import your courses</p>
        )}
      </div>
      {!hasQuery && (
        <Button variant="hero" size="lg">Connect Canvas Account</Button>
      )}
    </Stack>
  </Surface>
);

export default CoursesEmpty;

