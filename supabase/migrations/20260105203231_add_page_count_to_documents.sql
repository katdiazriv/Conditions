/*
  # Add Page Count Column to Condition Documents

  1. Changes to `condition_documents` table
    - `page_count` (integer, nullable) - Number of pages in the PDF document
    
  2. Notes
    - Column is nullable to maintain backward compatibility with existing documents
    - Existing documents will have NULL page_count until viewed (then populated dynamically)
    - All newly uploaded documents will have page_count set during upload
    - For converted images, page_count will always be 1
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'page_count'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN page_count integer;
  END IF;
END $$;