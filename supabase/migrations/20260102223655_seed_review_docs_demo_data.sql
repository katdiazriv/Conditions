/*
  # Seed Review Docs Demo Data

  This migration adds sample documents to existing conditions for testing
  the Review Docs wizard modal.

  1. Documents Added
    - Bank statements linked to ASSET conditions
    - Pay stubs linked to INC conditions
    - Tax returns linked to conditions
    - Unassigned loan-level documents

  2. Document Types
    - "Need to Review" status for Processor III review
    - "Reviewed" status for Underwriter review
    - Various document types to demonstrate grouping

  3. Notes
    - Documents are linked to existing conditions from demo data
    - Some documents are linked to the demo loan but not conditions
*/

DO $$
DECLARE
  v_loan_id uuid;
  v_condition_id_1 uuid;
  v_condition_id_2 uuid;
  v_condition_id_3 uuid;
BEGIN
  SELECT id INTO v_loan_id FROM loans WHERE loan_number = 'TEST0001' LIMIT 1;
  
  IF v_loan_id IS NULL THEN
    RAISE NOTICE 'Demo loan not found, skipping document seeding';
    RETURN;
  END IF;

  SELECT id INTO v_condition_id_1 
  FROM conditions 
  WHERE loan_id = v_loan_id AND category = 'ASSET' 
  LIMIT 1;

  SELECT id INTO v_condition_id_2 
  FROM conditions 
  WHERE loan_id = v_loan_id AND category = 'INC' 
  LIMIT 1;

  SELECT id INTO v_condition_id_3 
  FROM conditions 
  WHERE loan_id = v_loan_id AND category = 'PROP' 
  LIMIT 1;

  IF v_condition_id_1 IS NOT NULL THEN
    INSERT INTO condition_documents (condition_id, loan_id, document_name, document_type, status, description)
    VALUES 
      (v_condition_id_1, v_loan_id, 'Chase_Statement_Oct2024.pdf', 'Bank Statements', 'Need to Review', 'October 2024 bank statement from Chase'),
      (v_condition_id_1, v_loan_id, 'Chase_Statement_Nov2024.pdf', 'Bank Statements', 'Need to Review', 'November 2024 bank statement from Chase'),
      (v_condition_id_1, v_loan_id, 'WellsFargo_Statement_Oct.pdf', 'Bank Statements', 'Reviewed', 'October 2024 statement from Wells Fargo');
  END IF;

  IF v_condition_id_2 IS NOT NULL THEN
    INSERT INTO condition_documents (condition_id, loan_id, document_name, document_type, status, description)
    VALUES 
      (v_condition_id_2, v_loan_id, 'PayStub_Nov15_2024.pdf', 'Pay Stubs', 'Need to Review', 'Pay stub for period ending Nov 15'),
      (v_condition_id_2, v_loan_id, 'PayStub_Nov30_2024.pdf', 'Pay Stubs', 'Need to Review', 'Pay stub for period ending Nov 30'),
      (v_condition_id_2, v_loan_id, 'W2_2023.pdf', 'W-2 Forms', 'Reviewed', '2023 W-2 form from employer');
  END IF;

  IF v_condition_id_3 IS NOT NULL THEN
    INSERT INTO condition_documents (condition_id, loan_id, document_name, document_type, status, description)
    VALUES 
      (v_condition_id_3, v_loan_id, 'Appraisal_Report.pdf', 'Appraisal', 'Need to Review', 'Property appraisal report');
  END IF;

  INSERT INTO condition_documents (condition_id, loan_id, document_name, document_type, status, description)
  VALUES 
    (NULL, v_loan_id, 'scanned_document_001.pdf', NULL, 'Need to Review', 'Miscellaneous scanned document'),
    (NULL, v_loan_id, 'Insurance_Binder.pdf', 'Hazard Insurance Binder', 'Need to Review', 'Hazard insurance binder document');

END $$;