/*
  # Sync Missing Conditions to Available Conditions

  1. Purpose
    - Copies conditions from the `conditions` table that are missing from `available_conditions`
    - Ensures all loan conditions have a corresponding entry in the available conditions library
    - This fixes the "Added" tag not displaying for conditions that were added directly

  2. Conditions Being Added
    - CRED-315: Credit Invoice
    - CRED-316: Matching Credit Report Scores
    - CRED-317: Debt Monitoring
    - EMP-100: LOE (Letter of Explanation)
    - INC-200: VOE (Verification of Employment)
    - INC-201: Paystubs
    - INC-202: W2s
    - INC-203: Tax Returns
    - PROP-601: Hazard Insurance
    - PROP-602: Flood Insurance
    - PROP-603: HOA Cert
    - TITLE-400: Title Commitment
    - TITLE-401: Survey

  3. Mapping
    - `stage` from conditions maps to `default_stage` in available_conditions
    - All other fields map directly
*/

INSERT INTO available_conditions (condition_id, category, title, description, source_type, condition_class, responsibility, default_stage)
SELECT DISTINCT ON (c.condition_id)
  c.condition_id,
  c.category,
  c.title,
  c.description,
  c.source_type,
  c.condition_class,
  c.responsibility,
  c.stage as default_stage
FROM conditions c
LEFT JOIN available_conditions ac ON c.condition_id = ac.condition_id
WHERE ac.condition_id IS NULL
ON CONFLICT (condition_id) DO NOTHING;
