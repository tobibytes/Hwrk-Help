import React from 'react';
import { Link } from 'react-router-dom';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { HomeIcon, AlertTriangleIcon } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Surface variant="card" padding="xl" className="text-center max-w-md w-full">
        <Stack gap="lg" align="center">
          <div className="p-4 rounded-full bg-warning-light">
            <AlertTriangleIcon className="h-12 w-12 text-warning" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
            <p className="text-foreground-secondary">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to="/">
              <HomeIcon className="h-5 w-5" />
              Return to Dashboard
            </Link>
          </Button>
        </Stack>
      </Surface>
    </div>
  );
};

export default NotFound;
