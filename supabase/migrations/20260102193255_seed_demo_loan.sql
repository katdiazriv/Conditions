/*
  # Seed Demo Loan Data

  1. Data Inserted
    - Demo loan with ID matching existing conditions data
    - Loan number: TEST0001
    - Description: Smith Family Purchase
    - Status: Approved

  2. Notes
    - Uses the existing demo loan UUID (11111111-1111-1111-1111-111111111111)
      to maintain association with existing conditions and parties data
*/

INSERT INTO loans (id, loan_number, description, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'TEST0001',
  'Smith Family Purchase',
  'Approved'
)
ON CONFLICT (id) DO NOTHING;
