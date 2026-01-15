/*
  # Conditions Portal Schema

  1. New Tables
    - `conditions` - Master list of loan conditions
      - `id` (uuid, primary key)
      - `category` (text) - Category code like ASSET, CRED, PROP, etc.
      - `condition_id` (text) - Display ID like ASSET-500
      - `title` (text) - Short title like "Sufficient Funds:"
      - `description` (text) - Full condition description
      - `source_type` (text) - BRW (borrower-facing) or INT (internal)
      - `condition_class` (text) - UW or Processor III
      - `responsibility` (text) - Underwriter or Processor
      - `stage` (text) - Prior to Docs, Prior to Funding, etc.
      - `status` (text) - Current status
      - `status_date` (timestamptz) - When status was set
      - `status_set_by` (text) - Who set the status
      - `created_at` (timestamptz)
      - `loan_id` (uuid) - Reference to loan

    - `doc_requests` - Document requests linked to conditions
      - `id` (uuid, primary key)
      - `condition_id` (uuid) - FK to conditions
      - `fulfillment_party` (text) - APP1, B1, CB1
      - `document_name` (text) - Name of document requested
      - `status` (text) - Request status
      - `created_at` (timestamptz)

    - `condition_notes` - Notes on conditions
      - `id` (uuid, primary key)
      - `condition_id` (uuid) - FK to conditions
      - `author_name` (text) - Name of note author
      - `author_role` (text) - Role like Underwriter, Processor
      - `content` (text) - Note content
      - `is_read` (boolean) - Read/unread status
      - `created_at` (timestamptz)

    - `condition_documents` - Documents attached to conditions
      - `id` (uuid, primary key)
      - `condition_id` (uuid) - FK to conditions
      - `document_name` (text) - Name of document
      - `needs_review` (boolean) - Whether doc needs review
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  condition_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  source_type text NOT NULL DEFAULT 'BRW',
  condition_class text NOT NULL DEFAULT 'UW',
  responsibility text NOT NULL DEFAULT 'Underwriter',
  stage text NOT NULL DEFAULT 'Prior to Docs',
  status text NOT NULL DEFAULT 'New',
  status_date timestamptz DEFAULT now(),
  status_set_by text DEFAULT 'System',
  loan_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  fulfillment_party text NOT NULL DEFAULT 'B1',
  document_name text NOT NULL,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condition_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT 'Processor',
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condition_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  needs_review boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to conditions"
  ON conditions FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to doc_requests"
  ON doc_requests FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to condition_notes"
  ON condition_notes FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to condition_documents"
  ON condition_documents FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_conditions_stage ON conditions(stage);
CREATE INDEX IF NOT EXISTS idx_conditions_status ON conditions(status);
CREATE INDEX IF NOT EXISTS idx_conditions_category ON conditions(category);
CREATE INDEX IF NOT EXISTS idx_doc_requests_condition ON doc_requests(condition_id);
CREATE INDEX IF NOT EXISTS idx_condition_notes_condition ON condition_notes(condition_id);
CREATE INDEX IF NOT EXISTS idx_condition_documents_condition ON condition_documents(condition_id);