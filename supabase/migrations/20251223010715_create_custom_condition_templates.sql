/*
  # Create Custom Condition Templates Table

  1. New Tables
    - `custom_condition_templates`
      - `id` (uuid, primary key) - Unique identifier for each template
      - `user_id` (text, nullable) - User who created the template (null for demo mode)
      - `category` (text) - Category code like ASSET, CRED, PROP, etc.
      - `condition_number` (integer) - Custom condition number starting at 9001
      - `title` (text) - Short title for the condition
      - `description` (text) - Full condition description
      - `source_type` (text) - BRW (borrower-facing) or INT (internal)
      - `condition_class` (text) - UW or Processor III
      - `responsibility` (text) - Underwriter or Processor
      - `default_stage` (text) - Default stage like Prior to Docs, Prior to Funding, etc.
      - `created_at` (timestamptz) - When the template was created

  2. Indexes
    - Index on user_id for efficient template retrieval
    - Unique constraint on user_id + condition_number for per-user uniqueness

  3. Security
    - Enable RLS on the table
    - Add policies for authenticated and anonymous users (demo mode)
*/

CREATE TABLE IF NOT EXISTS custom_condition_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  category text NOT NULL,
  condition_number integer NOT NULL DEFAULT 9001,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT 'BRW',
  condition_class text NOT NULL DEFAULT 'UW',
  responsibility text NOT NULL DEFAULT 'Underwriter',
  default_stage text NOT NULL DEFAULT 'Prior to Docs',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_condition_templates_user_number 
  ON custom_condition_templates(COALESCE(user_id, ''), condition_number);

CREATE INDEX IF NOT EXISTS idx_custom_condition_templates_user_id 
  ON custom_condition_templates(user_id);

ALTER TABLE custom_condition_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users on their templates"
  ON custom_condition_templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Allow insert for authenticated users on their templates"
  ON custom_condition_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Allow update for authenticated users on their templates"
  ON custom_condition_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Allow delete for authenticated users on their templates"
  ON custom_condition_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Allow select for anonymous users on demo templates"
  ON custom_condition_templates FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Allow insert for anonymous users on demo templates"
  ON custom_condition_templates FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow update for anonymous users on demo templates"
  ON custom_condition_templates FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow delete for anonymous users on demo templates"
  ON custom_condition_templates FOR DELETE
  TO anon
  USING (user_id IS NULL);