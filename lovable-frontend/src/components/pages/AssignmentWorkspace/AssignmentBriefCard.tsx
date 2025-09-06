import React, { useMemo, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface BriefData {
  assignment_id: string;
  title: string;
  deliverables?: string[];
  constraints?: string[];
  format?: { length?: string; citation?: string };
  rubric_points?: string[];
  updated_at?: string;
}

const AssignmentBriefCard: React.FC<{
  brief: BriefData | null;
  busy: boolean;
  onExtract: (text: string) => void;
}> = ({ brief, busy, onExtract }) => {
  const [text, setText] = useState('');
  const hasBrief = !!brief;
  const updated = useMemo(() => brief?.updated_at ? new Date(brief.updated_at).toLocaleString() : null, [brief?.updated_at]);

  return (
    <Surface variant="card" padding="lg">
      <Stack gap="md">
        <h2 className="text-xl font-semibold">Brief</h2>
        {!hasBrief && (
          <Stack gap="sm">
            <p className="text-sm text-foreground-secondary">Paste the assignment instructions and click Extract to build a structured brief.</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste assignment instructions here"
              className="min-h-[140px]"
            />
            <div>
              <Button onClick={() => onExtract(text)} disabled={!text.trim() || busy}>
                {busy ? 'Extracting…' : 'Extract Brief'}
              </Button>
            </div>
          </Stack>
        )}

        {hasBrief && (
          <Stack gap="md">
            <div className="text-sm text-foreground-muted">Last updated{updated ? `: ${updated}` : ''}</div>
            <div>
              <div className="font-medium">Title</div>
              <div className="text-foreground-secondary">{brief!.title}</div>
            </div>
            {brief!.deliverables && brief!.deliverables.length > 0 && (
              <div>
                <div className="font-medium">Deliverables</div>
                <ul className="list-disc pl-6 text-foreground-secondary">
                  {brief!.deliverables!.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {brief!.constraints && brief!.constraints.length > 0 && (
              <div>
                <div className="font-medium">Constraints</div>
                <ul className="list-disc pl-6 text-foreground-secondary">
                  {brief!.constraints!.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {brief!.format && (
              <div>
                <div className="font-medium">Format</div>
                <div className="text-foreground-secondary">
                  {brief!.format?.length && <div>Length: {brief!.format.length}</div>}
                  {brief!.format?.citation && <div>Citation: {brief!.format.citation}</div>}
                </div>
              </div>
            )}
            {brief!.rubric_points && brief!.rubric_points.length > 0 && (
              <div>
                <div className="font-medium">Rubric</div>
                <ul className="list-disc pl-6 text-foreground-secondary">
                  {brief!.rubric_points!.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </Stack>
        )}
      </Stack>
    </Surface>
  );
};

export default AssignmentBriefCard;
