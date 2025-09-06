import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Box } from '@/components/ui/box';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-illustration.jpg';
import { 
  BookOpenIcon,
  FolderIcon,
  SearchIcon,
  SettingsIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClockIcon,
  ListTodoIcon
} from 'lucide-react';

const IndexPage = () => {
  const quickActions = [
    {
      title: 'Homework',
      description: 'See assignments and open workspaces',
      icon: ListTodoIcon,
      href: '/homework',
      variant: 'hero' as const,
    },
    {
      title: 'Sync Now',
      description: 'Update your course materials',
      icon: RefreshCwIcon,
      href: '/settings',
      variant: 'default' as const,
    },
    {
      title: 'Browse Courses',
      description: 'View all your courses',
      icon: BookOpenIcon,
      href: '/courses',
      variant: 'default' as const,
    },
    {
      title: 'Search Documents',
      description: 'Find study materials',
      icon: SearchIcon,
      href: '/search',
      variant: 'accent' as const,
    },
    {
      title: 'Settings',
      description: 'Configure your account',
      icon: SettingsIcon,
      href: '/settings',
      variant: 'secondary' as const,
    },
  ];

  const recentDocuments = [
    {
      id: '1',
      title: 'Introduction to Algorithms - Chapter 5',
      course: 'CS 2420',
      lastModified: '2 hours ago',
      type: 'PDF',
    },
    {
      id: '2',
      title: 'Calculus II - Integration Techniques',
      course: 'MATH 1210',
      lastModified: '1 day ago',
      type: 'Notes',
    },
    {
      id: '3',
      title: 'Modern Physics - Quantum Mechanics',
      course: 'PHYS 3710',
      lastModified: '2 days ago',
      type: 'Slides',
    },
  ];

  return (
    <Box className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Hero Section */}
      <Surface variant="glass" padding="xl" className="text-center">
        <Stack gap="lg" align="center">
          <Stack direction="row" className="flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient-primary">
              Welcome to Talvra
            </h1>
          </Stack>
          <p className="text-xl text-foreground-secondary max-w-2xl">
            Transform your course materials into powerful study aids with AI-powered notes, 
            flashcards, and semantic search across all your documents.
          </p>
        </Stack>
      </Surface>

      {/* Quick Actions Grid */}
      <Box>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Surface
              key={action.title}
              variant="card"
              padding="lg"
              className="group cursor-pointer hover:shadow-lg transition-all duration-smooth"
            >
              <Stack gap="md" align="center" className="text-center">
                <div className="p-3 rounded-lg bg-gradient-primary/10">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-foreground-secondary">{action.description}</p>
                </div>
                <Button 
                  asChild
                  variant={action.variant} 
                  size="sm" 
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  <Link to={action.href}>
                    Get Started
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </Stack>
            </Surface>
          ))}
        </Box>
      </Box>

      {/* Recent Documents */}
      <Box>
        <Stack className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Documents</h2>
          <Button variant="outline" size="sm">
            <FolderIcon className="h-4 w-4" />
            View All
          </Button>
        </Stack>

        {recentDocuments.length > 0 ? (
          <Box className="grid gap-4">
            {recentDocuments.map((doc) => (
              <Surface
                key={doc.id}
                variant="card"
                padding="lg"
                className="hover:shadow-md transition-all duration-smooth cursor-pointer"
              >
                <Stack direction="row" justify="between" align="center">
                  <div className="flex-1">
                    <Stack gap="sm">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-foreground">{doc.title}</h3>
                        <Chip variant="primary" size="sm">{doc.course}</Chip>
                        <Chip variant="default" size="sm">{doc.type}</Chip>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <ClockIcon className="h-4 w-4" />
                        Last modified {doc.lastModified}
                      </div>
                    </Stack>
                  </div>
                  <Stack direction="row" gap="sm">
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                    <Button variant="secondary" size="sm">
                      AI Summary
                    </Button>
                    <Button variant="accent" size="sm">
                      Video
                    </Button>
                  </Stack>
                </Stack>
              </Surface>
            ))}
          </Box>
        ) : (
          <Surface variant="card" padding="xl" className="text-center">
            <Stack gap="lg" align="center">
              <div className="p-4 rounded-full bg-background-secondary">
                <FolderIcon className="h-8 w-8 text-foreground-muted" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
                <p className="text-foreground-secondary">
                  Connect your Canvas account and sync your courses to get started.
                </p>
              </div>
              <Button variant="hero" size="lg">
                <RefreshCwIcon className="h-5 w-5" />
                Sync Your Courses
              </Button>
            </Stack>
          </Surface>
        )}
      </Box>
    </Box>
  );
};

export default IndexPage;

