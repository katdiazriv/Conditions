/*
  # Add Conditions Modal Schema

  1. New Tables
    - `available_conditions` - Master library of condition templates
      - `id` (uuid, primary key)
      - `category` (text) - Category code like ASSET, CRED, INC, etc.
      - `condition_id` (text) - Display ID like ASSET-500
      - `title` (text) - Short title for the condition
      - `description` (text) - Full condition description
      - `source_type` (text) - BRW (borrower-facing) or INT (internal)
      - `condition_class` (text) - UW or Processor III
      - `responsibility` (text) - Underwriter or Processor
      - `default_stage` (text) - Default stage when added to loan
      - `created_at` (timestamptz)

    - `loan_parties` - Borrowers/parties for each loan
      - `id` (uuid, primary key)
      - `loan_id` (uuid) - Reference to loan
      - `party_type` (text) - e.g., B1, APP1, CB1
      - `party_name` (text) - e.g., Briana Borrower
      - `created_at` (timestamptz)

    - `custom_lists` - User-saved condition lists
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - For demo purposes
      - `name` (text) - List name
      - `created_at` (timestamptz)

    - `custom_list_conditions` - Junction table for lists and conditions
      - `id` (uuid, primary key)
      - `list_id` (uuid) - FK to custom_lists
      - `available_condition_id` (uuid) - FK to available_conditions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anon users (demo mode)

  3. Indexes
    - Index on available_conditions.category for filtering
    - Index on loan_parties.loan_id for lookups
*/

CREATE TABLE IF NOT EXISTS available_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  condition_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  source_type text NOT NULL DEFAULT 'BRW',
  condition_class text NOT NULL DEFAULT 'UW',
  responsibility text NOT NULL DEFAULT 'Underwriter',
  default_stage text NOT NULL DEFAULT 'Prior to Docs',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid,
  party_type text NOT NULL,
  party_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_list_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
  available_condition_id uuid NOT NULL REFERENCES available_conditions(id) ON DELETE CASCADE
);

ALTER TABLE available_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_list_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to available_conditions"
  ON available_conditions FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to loan_parties"
  ON loan_parties FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to custom_lists"
  ON custom_lists FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to custom_list_conditions"
  ON custom_list_conditions FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_available_conditions_category ON available_conditions(category);
CREATE INDEX IF NOT EXISTS idx_loan_parties_loan_id ON loan_parties(loan_id);
CREATE INDEX IF NOT EXISTS idx_custom_list_conditions_list_id ON custom_list_conditions(list_id);
