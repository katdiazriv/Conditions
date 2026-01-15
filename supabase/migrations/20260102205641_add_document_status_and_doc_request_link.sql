/*
  # Add Document Status and Doc Request Association

  1. Changes to `condition_documents` table
    - Add `status` column (text, NOT NULL) with default 'Need to Review'
      - 'Need to Review' - Borrower uploaded, awaiting review by LO/PA/Processor
      - 'Reviewed' - Employee reviewed and accepted the document
      - 'Approved' - Underwriter approved the document
      - 'Inactive' - Employee rejected the document
    - Add `doc_request_id` column (uuid, nullable) - optional FK to doc_requests
    - Remove `needs_review` column (replaced by status)

  2. Data Migration
    - Existing docs with needs_review=true -> status='Need to Review'
    - Existing docs with needs_review=false -> status='Reviewed'

  3. Indexes
    - Index on doc_request_id for efficient lookups
    - Index on status for filtering by document status

  4. Notes
    - Documents do not require association to a doc_request (nullable FK)
    - ON DELETE SET NULL preserves documents if their linked request is deleted
    - Inactive documents should be filtered out in application queries
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'status'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN status text NOT NULL DEFAULT 'Need to Review';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'doc_request_id'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN doc_request_id uuid REFERENCES doc_requests(id) ON DELETE SET NULL;
  END IF;
END $$;

UPDATE condition_documents
SET status = CASE
  WHEN needs_review = true THEN 'Need to Review'
  ELSE 'Reviewed'
END
WHERE status = 'Need to Review' AND needs_review IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'needs_review'
  ) THEN
    ALTER TABLE condition_documents DROP COLUMN needs_review;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'condition_documents_status_check'
  ) THEN
    ALTER TABLE condition_documents
    ADD CONSTRAINT condition_documents_status_check
    CHECK (status IN ('Need to Review', 'Reviewed', 'Approved', 'Inactive'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_condition_documents_doc_request ON condition_documents(doc_request_id);
CREATE INDEX IF NOT EXISTS idx_condition_documents_status ON condition_documents(status);