-- AI service versioning schema (optional; not yet wired)
-- This migration is a placeholder for future DB-backed versioning if desired.

CREATE TABLE IF NOT EXISTS ai_versions (
  id uuid PRIMARY KEY,
  doc_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deprecated boolean NOT NULL DEFAULT false,
  notes_path text NOT NULL,
  flashcards_path text NOT NULL,
  model text,
  generation text
);

CREATE INDEX IF NOT EXISTS ai_versions_doc_id_idx ON ai_versions(doc_id);

