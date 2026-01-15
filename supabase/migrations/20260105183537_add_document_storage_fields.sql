/*
  # Add Document Storage Fields for File Uploads

  1. Changes to `condition_documents` table
    - `file_url` (text, nullable) - Supabase Storage URL for the uploaded file
    - `thumbnail_url` (text, nullable) - Supabase Storage URL for the generated thumbnail
    - `file_size` (bigint, nullable) - File size in bytes for display
    - `mime_type` (text, nullable) - MIME type of the uploaded file  
    - `original_filename` (text, nullable) - Original name of the uploaded file

  2. Indexes
    - Index on file_url for efficient lookups of uploaded documents

  3. Notes
    - All new columns are nullable to maintain backward compatibility
    - Existing documents without uploads will have NULL values
    - file_url stores the Supabase Storage public URL
    - thumbnail_url stores a generated thumbnail for images/PDFs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN file_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN thumbnail_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN mime_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'condition_documents' AND column_name = 'original_filename'
  ) THEN
    ALTER TABLE condition_documents ADD COLUMN original_filename text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_condition_documents_file_url ON condition_documents(file_url) WHERE file_url IS NOT NULL;