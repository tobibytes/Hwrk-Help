import React from 'react';
import { TalvraCard } from '@/components/talvra/TalvraCard';
import { TalvraStack } from '@/components/talvra/TalvraStack';
import { TalvraChip } from '@/components/talvra/TalvraChip';
import { TalvraButton } from '@/components/talvra/TalvraButton';
import { BookOpenIcon, CalendarIcon, ArrowRightIcon, RefreshCwIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CourseItem {
  id: string;
  name: string;
  term: string | null;
}

export function TalvraCourseCard({ course, onSync }: { course: CourseItem; onSync: () => void }) {
  return (
    <TalvraCard className="group hover:shadow-lg transition-all duration-smooth cursor-pointer">
      <TalvraStack gap={"md" as any}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <TalvraStack className="gap-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {course.name}
              </h3>
              <TalvraChip variant="default" size="sm">
                {course.id}
              </TalvraChip>
            </TalvraStack>
          </div>
          <BookOpenIcon className="h-5 w-5 text-foreground-muted" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
            <CalendarIcon className="h-4 w-4" />
            {course.term}
          </div>
        </div>

        <TalvraStack direction={"row" as any} className="gap-2 pt-2">
          <TalvraButton variant="default" size="sm" className="flex-1" asChild>
            <Link to={`/courses/${encodeURIComponent(course.id)}`}>
              <ArrowRightIcon className="h-4 w-4" />
              Open
            </Link>
          </TalvraButton>
          <TalvraButton variant="outline" size="sm" onClick={onSync}>
            <RefreshCwIcon className="h-4 w-4" />
          </TalvraButton>
        </TalvraStack>
      </TalvraStack>
    </TalvraCard>
  );
}

