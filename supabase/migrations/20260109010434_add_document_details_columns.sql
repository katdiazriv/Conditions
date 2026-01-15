/*
  # Add Document Details Columns

  1. Changes to `condition_documents` table
    - Add `document_for_party_id` (uuid, nullable) - Foreign key to loan_parties table for associating document with a borrower
    - Add `created_by` (text, nullable) - Name of user who created/uploaded the document
    - Add `created_on` (timestamptz, nullable) - Timestamp when document was created (defaults to created_at)
    - Add `modified_by` (text, nullable) - Name of user who last modified the document
    - Add `modified_on` (timestamptz, nullable) - Timestamp of last modification

  2. Indexes
    - Add index on document_for_party_id for efficient lookups

  3. Data Migration
    - Backfill created_on from existing created_at values for existing records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'document_for_party_id'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN document_for_party_id uuid REFERENCES loan_parties(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN created_by text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'created_on'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN created_on timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'modified_by'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN modified_by text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'modified_on'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN modified_on timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_condition_documents_party ON condition_documents(document_for_party_id);

UPDATE condition_documents
SET created_on = created_at
WHERE created_on IS NULL;