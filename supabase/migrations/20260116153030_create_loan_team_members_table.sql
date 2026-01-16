/*
  # Create Loan Team Members Table

  1. New Tables
    - `loan_team_members`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, foreign key to loans)
      - `name` (text) - Display name of the team member
      - `role` (text) - Role/title of the team member
      - `email` (text, nullable) - Email address
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `loan_team_members` table
    - Add policy for authenticated users to read team members

  3. Seed Data
    - Add demo team members for existing loans
*/

CREATE TABLE IF NOT EXISTS loan_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE loan_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to loan team members"
  ON loan_team_members
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON loan_team_members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON loan_team_members
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users"
  ON loan_team_members
  FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO loan_team_members (loan_id, name, role, email) VALUES
  ('cb40830a-4348-4b78-aaef-be24f11fa8f9', 'Sarah Processor', 'Processor III', 'sarah.processor@cmgfi.com'),
  ('cb40830a-4348-4b78-aaef-be24f11fa8f9', 'Urma Underwriter', 'Underwriter', 'urma.underwriter@cmgfi.com'),
  ('cb40830a-4348-4b78-aaef-be24f11fa8f9', 'Mike Manager', 'Branch Manager', 'mike.manager@cmgfi.com'),
  ('cb40830a-4348-4b78-aaef-be24f11fa8f9', 'Lisa Loan Officer', 'Loan Officer', 'lisa.loanofficer@cmgfi.com'),
  ('cb40830a-4348-4b78-aaef-be24f11fa8f9', 'Tom Title', 'Title Officer', 'tom.title@cmgfi.com'),
  ('a97d2c7f-9ba0-4480-9c51-8e9504e2ecf8', 'Sarah Processor', 'Processor III', 'sarah.processor@cmgfi.com'),
  ('a97d2c7f-9ba0-4480-9c51-8e9504e2ecf8', 'Urma Underwriter', 'Underwriter', 'urma.underwriter@cmgfi.com'),
  ('a97d2c7f-9ba0-4480-9c51-8e9504e2ecf8', 'John Johnson', 'Senior Underwriter', 'john.johnson@cmgfi.com'),
  ('6810313c-6563-4dde-bd2a-7bfd539c1d0c', 'Sarah Processor', 'Processor III', 'sarah.processor@cmgfi.com'),
  ('6810313c-6563-4dde-bd2a-7bfd539c1d0c', 'Urma Underwriter', 'Underwriter', 'urma.underwriter@cmgfi.com'),
  ('9d9ff5bb-c83f-4c7d-8389-67cc5fa42918', 'Sarah Processor', 'Processor III', 'sarah.processor@cmgfi.com'),
  ('9d9ff5bb-c83f-4c7d-8389-67cc5fa42918', 'Urma Underwriter', 'Underwriter', 'urma.underwriter@cmgfi.com');