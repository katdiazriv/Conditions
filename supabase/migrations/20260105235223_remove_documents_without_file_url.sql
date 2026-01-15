/*
  # One-Time Cleanup: Remove Documents Without File URLs

  This migration permanently removes document records that have no associated file.
  These are placeholder/orphan records that were created but never had files uploaded.

  ## Changes
  - Deletes all rows from `condition_documents` where `file_url IS NULL`
  - Related `document_notes` records are automatically removed via CASCADE constraint
*/

DELETE FROM condition_documents
WHERE file_url IS NULL;
