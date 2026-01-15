/*
  # Create Note Read Status Table for Role-Based Read Tracking

  1. New Tables
    - `note_read_status`
      - `id` (uuid, primary key)
      - `note_id` (uuid, FK to condition_notes, required)
      - `role` (text, the role that read the note, required)
      - `read_at` (timestamptz, when the note was read)
      - Unique constraint on (note_id, role)

  2. Purpose
    - Tracks which roles have read which notes
    - Allows notes to appear unread for one role while being read by another
    - The author's role automatically marks the note as read when created

  3. Security
    - RLS enabled
    - Policy for authenticated users to view read status

  4. Indexes
    - Index on note_id for join performance
    - Index on role for filtering

  5. Migration Logic
    - For existing notes, the author's role is marked as having read the note
*/

-- Create note_read_status table
CREATE TABLE IF NOT EXISTS note_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES condition_notes(id) ON DELETE CASCADE,
  role text NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(note_id, role)
);

-- Enable RLS
ALTER TABLE note_read_status ENABLE ROW LEVEL SECURITY;

-- Create policy for reading
CREATE POLICY "Anyone can view note read status"
  ON note_read_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for inserting
CREATE POLICY "Anyone can insert note read status"
  ON note_read_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_note_read_status_note_id ON note_read_status(note_id);
CREATE INDEX IF NOT EXISTS idx_note_read_status_role ON note_read_status(role);

-- Backfill read status for existing notes
-- Mark notes as read by the author's role
INSERT INTO note_read_status (note_id, role, read_at)
SELECT 
  cn.id,
  cn.author_role,
  cn.created_at
FROM condition_notes cn
WHERE NOT EXISTS (
  SELECT 1 FROM note_read_status nrs 
  WHERE nrs.note_id = cn.id AND nrs.role = cn.author_role
)
ON CONFLICT (note_id, role) DO NOTHING;
