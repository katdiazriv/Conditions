/*
  # Backfill loan_id on condition_notes

  1. Problem
    - Some condition_notes records are missing the loan_id field
    - This causes the NotesModal to not display notes (it filters by loan_id)
    - This causes the bell icon unread badge to show 0

  2. Solution
    - Update all condition_notes with NULL loan_id to use the loan_id from their associated condition
    - For any remaining notes without a condition_id, set loan_id to the demo loan
    - This ensures all notes are properly associated with a loan

  3. Notes
    - This is a data fix migration
    - The demo loan UUID is '11111111-1111-1111-1111-111111111111'
*/

-- First, backfill loan_id from the associated condition
UPDATE condition_notes cn
SET loan_id = c.loan_id
FROM conditions c
WHERE cn.condition_id = c.id
  AND cn.loan_id IS NULL
  AND c.loan_id IS NOT NULL;

-- For any remaining notes without loan_id (loan-level notes or orphaned notes),
-- set to the demo loan
UPDATE condition_notes
SET loan_id = '11111111-1111-1111-1111-111111111111'
WHERE loan_id IS NULL;
