/*
  # Remove document_name column from doc_requests

  1. Changes
    - Drop the document_name column from doc_requests table
    - Make document_type column NOT NULL with a default value
    - Document_type now serves as the primary identifier for requested documents

  2. Notes
    - All existing document_name values have been migrated to document_type
    - The column is now safe to remove as all code references have been updated
*/

ALTER TABLE doc_requests
  ALTER COLUMN document_type SET NOT NULL,
  ALTER COLUMN document_type SET DEFAULT 'Miscellaneous';

ALTER TABLE doc_requests
  DROP COLUMN IF EXISTS document_name;