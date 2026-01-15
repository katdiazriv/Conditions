/*
  # Add Edit Condition Modal Columns

  1. Changes to `conditions` table
    - `follow_up_flag` (boolean) - Flag to mark condition for follow up
    - `expiration_date` (timestamptz) - Condition expiration date
    - `follow_up_date` (timestamptz) - Scheduled follow up date
    - `exception_requested_date` (timestamptz) - When exception was requested (read-only)
    - `exception_status` (text) - Exception request status (read-only)
    - Status history timestamps for tracking when each status was set:
      - `new_date` - When status changed to New
      - `need_brw_request_date` - When status changed to Need Brw Request
      - `requested_date` - When status changed to Requested
      - `processor_to_review_date` - When status changed to Processor to Review
      - `ready_for_uw_date` - When status changed to Ready for UW
      - `cleared_date` - When status changed to Cleared
      - `not_cleared_date` - When status changed to Not Cleared

  2. Changes to `doc_requests` table
    - `document_type` (text) - Type of document being requested
    - `description_for_borrower` (text) - Description shown to borrower

  3. Notes
    - All new columns are nullable to support existing data
    - Status history dates allow tracking the full lifecycle of a condition
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'follow_up_flag'
  ) THEN
    ALTER TABLE conditions ADD COLUMN follow_up_flag boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'expiration_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN expiration_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'follow_up_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN follow_up_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'exception_requested_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN exception_requested_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'exception_status'
  ) THEN
    ALTER TABLE conditions ADD COLUMN exception_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'new_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN new_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'need_brw_request_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN need_brw_request_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'requested_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN requested_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'processor_to_review_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN processor_to_review_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'ready_for_uw_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN ready_for_uw_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'cleared_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN cleared_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conditions' AND column_name = 'not_cleared_date'
  ) THEN
    ALTER TABLE conditions ADD COLUMN not_cleared_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doc_requests' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE doc_requests ADD COLUMN document_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doc_requests' AND column_name = 'description_for_borrower'
  ) THEN
    ALTER TABLE doc_requests ADD COLUMN description_for_borrower text;
  END IF;
END $$;