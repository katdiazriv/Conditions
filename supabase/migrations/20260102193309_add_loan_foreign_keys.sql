/*
  # Add Foreign Key Constraints for Loan Relationships

  1. Changes
    - Add foreign key from conditions.loan_id to loans.id
    - Add foreign key from loan_parties.loan_id to loans.id
    - Add foreign key from email_history.loan_id to loans.id

  2. Notes
    - Uses ON DELETE CASCADE so deleting a loan removes related data
    - Checks for existing constraints to prevent errors on re-run
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_conditions_loan'
  ) THEN
    ALTER TABLE conditions
    ADD CONSTRAINT fk_conditions_loan
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_loan_parties_loan'
  ) THEN
    ALTER TABLE loan_parties
    ADD CONSTRAINT fk_loan_parties_loan
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_email_history_loan'
  ) THEN
    ALTER TABLE email_history
    ADD CONSTRAINT fk_email_history_loan
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;
  END IF;
END $$;
