import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export interface HomeworkItem { id: string; name: string; due_at?: string | null; course_id: string; course_name: string }

const HomeworkList: React.FC<{ items: HomeworkItem[] }>= ({ items }) => (
  <Stack gap="md">
    {items.length === 0 ? (
      <div>No assignments found. Try syncing from Settings or Course Detail.</div>
    ) : (
      items.map(item => (
        <Surface key={`${item.course_id}:${item.id}`} variant="card" padding="lg" className="border border-border">
          <Stack gap="sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="text-sm text-foreground-secondary">Course: {item.course_name}</div>
                {item.due_at && (
                  <div className="text-xs text-foreground-muted">Due: {new Date(item.due_at).toLocaleString()}</div>
                )}
              </div>
              <Button asChild>
                <Link to={`/homework/${encodeURIComponent(item.course_id)}/${encodeURIComponent(item.id)}`}>Open Workspace</Link>
              </Button>
            </div>
          </Stack>
        </Surface>
      ))
    )}
  </Stack>
);

export default HomeworkList;
