/*
  # Create User Condition Flags Table

  1. New Tables
    - `user_condition_flags` - Personal flag colors for conditions per user
      - `id` (uuid, primary key)
      - `user_id` (text, not null) - User identifier (demo-user for prototype)
      - `condition_id` (uuid, foreign key) - Reference to conditions table
      - `flag_color` (text, not null) - Flag color: red, blue, yellow, green
      - `created_at` (timestamptz) - When flag was created

  2. Constraints
    - Unique constraint on (user_id, condition_id) to prevent duplicate flags
    - Foreign key to conditions table with cascade delete

  3. Security
    - Enable RLS with permissive policy for prototype

  4. Migration
    - Migrate existing follow_up_flag = true records to red flags for demo-user
*/

CREATE TABLE IF NOT EXISTS user_condition_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  condition_id uuid NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  flag_color text NOT NULL CHECK (flag_color IN ('red', 'blue', 'yellow', 'green')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, condition_id)
);

CREATE INDEX IF NOT EXISTS idx_user_condition_flags_condition ON user_condition_flags(condition_id);
CREATE INDEX IF NOT EXISTS idx_user_condition_flags_user ON user_condition_flags(user_id);

ALTER TABLE user_condition_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to user_condition_flags"
  ON user_condition_flags FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

INSERT INTO user_condition_flags (user_id, condition_id, flag_color)
SELECT 'demo-user', id, 'red'
FROM conditions
WHERE follow_up_flag = true
ON CONFLICT (user_id, condition_id) DO NOTHING;