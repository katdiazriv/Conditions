/*
  # Create Loans Table

  1. New Tables
    - `loans`
      - `id` (uuid, primary key)
      - `loan_number` (text, unique) - Format like TEST0001
      - `description` (text) - Editable description for the loan
      - `status` (text) - Current loan status with CHECK constraint
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on `loans` table
    - Add permissive policy for all operations (matching existing tables)

  3. Constraints
    - Status must be one of: Disclosed, File Received, UW Received, Approved, 
      Conditions for Review, Changes to UW, Clear to Close

  4. Indexes
    - Index on loan_number for efficient lookups
*/

CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'File Received',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_loan_status CHECK (
    status IN (
      'Disclosed',
      'File Received',
      'UW Received',
      'Approved',
      'Conditions for Review',
      'Changes to UW',
      'Clear to Close'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_loans_loan_number ON loans(loan_number);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on loans"
  ON loans
  FOR ALL
  USING (true)
  WITH CHECK (true);
