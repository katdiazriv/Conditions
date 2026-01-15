/*
  # Backfill loan_id on condition_documents

  1. Data Fix
    - Updates condition_documents that have a condition_id but null loan_id
    - Sets loan_id based on the associated condition's loan_id
    - Ensures all documents are properly linked to their loan

  2. Why This Is Needed
    - Documents were created without loan_id but with condition_id
    - Review Documents modal needs loan_id to filter documents correctly
    - This ensures consistent data for loan-based queries
*/

UPDATE condition_documents cd
SET loan_id = c.loan_id
FROM conditions c
WHERE cd.condition_id = c.id
  AND cd.loan_id IS NULL
  AND c.loan_id IS NOT NULL;