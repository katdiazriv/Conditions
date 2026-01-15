/*
  # Seed Demo Data for Edit Condition Modal

  Updates existing demo conditions with sample data for the new fields:
  - exception_requested_date and exception_status for Exception Request section
  - new_date for status history display
  - Sample doc request with document_type and description_for_borrower

  This allows users to see the Edit Condition modal with realistic data.
*/

UPDATE conditions
SET
  new_date = created_at,
  exception_requested_date = '2023-01-12 09:19:00',
  exception_status = 'Waived - Not Required'
WHERE loan_id = '11111111-1111-1111-1111-111111111111'
  AND condition_id LIKE 'PROP-%'
  AND exception_requested_date IS NULL;

UPDATE conditions
SET new_date = created_at
WHERE loan_id = '11111111-1111-1111-1111-111111111111'
  AND new_date IS NULL;

UPDATE doc_requests
SET
  document_type = 'Hazard Insurance Binder',
  description_for_borrower = ''
WHERE document_type IS NULL
  AND document_name LIKE '%Insurance%';

UPDATE doc_requests
SET
  document_type = 'Bank Statements',
  description_for_borrower = ''
WHERE document_type IS NULL
  AND document_name LIKE '%Bank%';

UPDATE doc_requests
SET
  document_type = 'Pay Stubs',
  description_for_borrower = ''
WHERE document_type IS NULL
  AND document_name LIKE '%Pay%';