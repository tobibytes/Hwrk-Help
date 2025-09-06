import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { SparklesIcon } from 'lucide-react';

const SearchEmpty: React.FC = () => (
  <Surface variant="card" padding="xl" className="text-center">
    <Stack gap="lg" align="center">
      <div className="p-4 rounded-full bg-primary-light">
        <SparklesIcon className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-foreground">Intelligent Document Search</h3>
        <p className="text-foreground-secondary max-w-md">
          Use natural language to find relevant information across all your course materials.
          Our AI understands context and meaning, not just keywords.
        </p>
      </div>
      <div className="text-sm text-foreground-muted space-y-1">
        <p><strong>Try asking:</strong></p>
        <p>"How does dynamic programming work?"</p>
        <p>"Integration techniques for trigonometric functions"</p>
        <p>"Quantum mechanics wave functions"</p>
      </div>
    </Stack>
  </Surface>
);

export default SearchEmpty;

