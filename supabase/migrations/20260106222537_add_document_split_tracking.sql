/*
  # Add Document Split Tracking

  1. Changes to `condition_documents` table
    - `parent_document_id` (uuid, nullable, FK) - References the original document this was split from
    - `source_pages` (text, nullable) - JSON array storing original page numbers used to create this split document

  2. Details
    - These columns enable tracking document lineage when documents are split
    - `parent_document_id` creates a parent-child relationship between original and split documents
    - `source_pages` stores which pages from the original PDF were used (e.g., "[1,2,3]")

  3. Security
    - No RLS changes needed as existing policies cover these new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'parent_document_id'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN parent_document_id uuid REFERENCES condition_documents(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'source_pages'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN source_pages text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_condition_documents_parent_id ON condition_documents(parent_document_id);
