import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';

interface AssignmentRow { id: string; name: string; due_at?: string | null }

const CourseAssignmentsCard: React.FC<{ assignments: AssignmentRow[] | null; courseId?: string }> = ({ assignments, courseId }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Assignments</h2>
      {!assignments ? (
        <div>Loading…</div>
      ) : assignments.length === 0 ? (
        <div>No assignments yet.</div>
      ) : (
        <Stack gap="sm">
          {assignments.map((a) => (
            <Surface key={a.id} variant="card" padding="md" className="border border-border">
              <div className="font-medium text-foreground">{a.name}</div>
              {a.due_at && <div className="text-xs text-foreground-muted">Due: {new Date(a.due_at).toLocaleString()}</div>}
              {courseId && (
                <div className="pt-2">
                  <a className="text-primary hover:underline" href={`/homework/${encodeURIComponent(courseId)}/${encodeURIComponent(a.id)}`}>Open Workspace</a>
                </div>
              )}
            </Surface>
          ))}
        </Stack>
      )}
    </Stack>
  </Surface>
);

export default CourseAssignmentsCard;

