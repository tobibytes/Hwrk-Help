-- Notifications schema (placeholder for schedules and messages)
CREATE TABLE IF NOT EXISTS reminder_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  course_canvas_id text,
  assignment_canvas_id text,
  remind_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reminder_schedules_due_idx ON reminder_schedules(remind_at);

