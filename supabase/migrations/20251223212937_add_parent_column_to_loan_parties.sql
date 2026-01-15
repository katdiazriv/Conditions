/*
  # Add Parent Column to Loan Parties

  1. Changes
    - Add `parent` column to `loan_parties` table
      - Type: text
      - Allowed values: 'APP1', 'APP2', 'EXT'
      - Default: 'APP1'
      - NOT NULL constraint
    - Update all existing parties to have parent = 'APP1'
    - Add check constraint to enforce valid parent values
    - Add index on parent column for efficient filtering

  2. Notes
    - Parent column groups loan parties under APP1 (Applicant 1), APP2 (Applicant 2), or EXT (External)
    - All existing parties are assigned to APP1 by default
*/

ALTER TABLE loan_parties 
ADD COLUMN IF NOT EXISTS parent text NOT NULL DEFAULT 'APP1';

ALTER TABLE loan_parties 
ADD CONSTRAINT loan_parties_parent_check 
CHECK (parent IN ('APP1', 'APP2', 'EXT'));

CREATE INDEX IF NOT EXISTS idx_loan_parties_parent 
ON loan_parties(parent);

UPDATE loan_parties SET parent = 'APP1' WHERE parent IS NULL OR parent = '';