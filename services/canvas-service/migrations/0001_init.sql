-- Initial schema for canvas-service
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id text UNIQUE NOT NULL,
  name text NOT NULL,
  term text,
  created_at timestamptz NOT NULL DEFAULT now()
);

