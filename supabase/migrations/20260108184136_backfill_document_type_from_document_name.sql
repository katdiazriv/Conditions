/*
  # Backfill document_type from document_name

  1. Purpose
    - Populate document_type column for all doc_requests where it is NULL
    - Map document_name values to standardized document_type values
    - Set unmapped values to "Miscellaneous"

  2. Mappings Applied
    - "Gift Letter" -> "Gift Letter"
    - "Title Commitment" -> "Title Insurance"
    - "Flood Insurance Policy" -> "Flood Insurance Binder"
    - All other unmapped values -> "Miscellaneous"

  3. Notes
    - Some records already have document_type set correctly
    - This migration prepares for removal of document_name column
*/

UPDATE doc_requests
SET document_type = CASE
  WHEN document_name = 'Gift Letter' THEN 'Gift Letter'
  WHEN document_name = 'Title Commitment' THEN 'Title Insurance'
  WHEN document_name = 'Flood Insurance Policy' THEN 'Flood Insurance Binder'
  ELSE 'Miscellaneous'
END
WHERE document_type IS NULL;