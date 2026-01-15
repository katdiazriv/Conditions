/*
  # Add Requested Date to Doc Requests

  1. Changes to `doc_requests` table
    - `requested_date` (timestamptz) - When the document request was sent to the borrower
    
  2. Notes
    - This column is nullable to support existing data
    - Will be populated when emails are sent in Step 2 of the workflow
    - Used to display "Requested MM/DD/YYYY" status in the Select Doc Requests modal
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doc_requests' AND column_name = 'requested_date'
  ) THEN
    ALTER TABLE doc_requests ADD COLUMN requested_date timestamptz;
  END IF;
END $$;