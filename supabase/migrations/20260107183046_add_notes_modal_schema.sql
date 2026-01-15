/*
  # Add Notes Modal Schema

  1. Schema Changes to condition_notes
    - ADD loan_id (uuid, nullable FK to loans) - allows loan-level notes
    - ALTER condition_id to be nullable - so loan-level notes don't need a condition
    - ADD note_type ('condition' | 'update') - categorize notes
    - ADD is_pinned (boolean) - allow pinning important notes
    - ADD CHECK constraint - ensure at least loan_id or condition_id is set
    - ADD indexes for performance

  2. Demo Data
    - Insert sample loan-level update notes with is_read=false
*/

-- Add loan_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_notes' AND column_name = 'loan_id'
  ) THEN
    ALTER TABLE condition_notes ADD COLUMN loan_id uuid REFERENCES loans(id);
  END IF;
END $$;

-- Make condition_id nullable
ALTER TABLE condition_notes ALTER COLUMN condition_id DROP NOT NULL;

-- Add note_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_notes' AND column_name = 'note_type'
  ) THEN
    ALTER TABLE condition_notes ADD COLUMN note_type text NOT NULL DEFAULT 'condition';
  END IF;
END $$;

-- Add is_pinned column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_notes' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE condition_notes ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add check constraint to ensure at least one of loan_id or condition_id is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'condition_notes_has_parent'
  ) THEN
    ALTER TABLE condition_notes ADD CONSTRAINT condition_notes_has_parent
      CHECK (loan_id IS NOT NULL OR condition_id IS NOT NULL);
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_condition_notes_loan_id ON condition_notes(loan_id);
CREATE INDEX IF NOT EXISTS idx_condition_notes_note_type ON condition_notes(loan_id, note_type);
CREATE INDEX IF NOT EXISTS idx_condition_notes_is_read ON condition_notes(is_read);

-- Backfill loan_id for existing condition notes
UPDATE condition_notes cn
SET loan_id = c.loan_id
FROM conditions c
WHERE cn.condition_id = c.id
  AND cn.loan_id IS NULL;

-- Insert demo loan-level update notes
INSERT INTO condition_notes (loan_id, condition_id, author_name, author_role, content, note_type, is_read, is_pinned)
SELECT 
  l.id,
  NULL,
  'Sarah Johnson',
  'Processor',
  'Borrower called - employment verification in progress. HR department confirmed they will send verification letter by Friday.',
  'update',
  false,
  true
FROM loans l
WHERE l.loan_number = '2024-001234'
ON CONFLICT DO NOTHING;

INSERT INTO condition_notes (loan_id, condition_id, author_name, author_role, content, note_type, is_read, is_pinned)
SELECT 
  l.id,
  NULL,
  'Mike Chen',
  'Underwriter',
  'Reviewed appraisal report. Value came in at $425,000 which supports the requested loan amount. No issues noted.',
  'update',
  false,
  false
FROM loans l
WHERE l.loan_number = '2024-001234'
ON CONFLICT DO NOTHING;

INSERT INTO condition_notes (loan_id, condition_id, author_name, author_role, content, note_type, is_read, is_pinned)
SELECT 
  l.id,
  NULL,
  'Sarah Johnson',
  'Processor',
  'Title company confirmed clear title. Insurance binder requested.',
  'update',
  false,
  false
FROM loans l
WHERE l.loan_number = '2024-001234'
ON CONFLICT DO NOTHING;