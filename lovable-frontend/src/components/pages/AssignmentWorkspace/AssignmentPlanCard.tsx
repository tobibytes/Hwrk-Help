import React, { useEffect, useMemo, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';

export interface PlanStep { id: string; title: string; eta_minutes: number; refs?: string[] }
export interface PlanData { assignment_id: string; q: string; steps: PlanStep[]; updated_at?: string }

function useLocalChecklist(key: string) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(done)); } catch {}
  }, [key, done]);
  const toggle = (id: string) => setDone((m) => ({ ...m, [id]: !m[id] }));
  return { done, toggle } as const;
}

const AssignmentPlanCard: React.FC<{ assignmentId: string; plan: PlanData | null; busy: boolean; onGenerate: () => void }> = ({ assignmentId, plan, busy, onGenerate }) => {
  const checklistKey = useMemo(() => `plan-checklist:${assignmentId}`, [assignmentId]);
  const { done, toggle } = useLocalChecklist(checklistKey);

  return (
    <Surface variant="card" padding="lg">
      <Stack gap="md">
        <h2 className="text-xl font-semibold">Plan</h2>
        <Button onClick={onGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate Plan'}</Button>
        {!plan ? (
          <div>No plan yet.</div>
        ) : (
          <Stack gap="sm">
            <div className="text-sm text-foreground-muted">Updated {plan.updated_at ? new Date(plan.updated_at).toLocaleString() : 'recently'}</div>
            <ul className="space-y-2">
              {plan.steps.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!done[s.id]}
                      onChange={() => toggle(s.id)}
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <div>
                      <div className="text-foreground">{s.title}</div>
                      <div className="text-xs text-foreground-muted">ETA: {s.eta_minutes} min{s.eta_minutes === 1 ? '' : 's'}</div>
                      {s.refs && s.refs.length > 0 && (
                        <div className="text-xs text-foreground-muted">Refs: {s.refs.join(', ')}</div>
                      )}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </Stack>
        )}
      </Stack>
    </Surface>
  );
};

export default AssignmentPlanCard;
